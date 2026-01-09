use crate::db::models::{Repo, Workspace};
use crate::place_names::select_available_name;
use crate::AppState;
use serde::Serialize;
use std::path::Path;
use std::process::Command;
use tauri::State;

#[derive(Debug, Clone, Serialize)]
pub struct RepoWithWorkspaces {
    #[serde(flatten)]
    pub repo: Repo,
    pub workspaces: Vec<Workspace>,
}

/// Get the last active time for a workspace (last commit time or current time if there are uncommitted changes)
fn get_last_active_time(repo_path: &str, workspace_directory: &str) -> Option<String> {
    let home_dir = dirs::home_dir()?;
    let repo_name = Path::new(repo_path).file_name()?.to_str()?;
    let worktree_path = home_dir
        .join("letsvibe-workspaces")
        .join(repo_name)
        .join(workspace_directory);

    if !worktree_path.exists() {
        return None;
    }

    // Check if there are uncommitted changes
    let status_output = Command::new("git")
        .arg("-C")
        .arg(&worktree_path)
        .arg("status")
        .arg("--porcelain")
        .output()
        .ok()?;

    // If there are uncommitted changes, use current time
    if status_output.status.success() && !status_output.stdout.is_empty() {
        return Some(chrono::Utc::now().to_rfc3339());
    }

    // Otherwise, get the last commit time
    let output = Command::new("git")
        .arg("-C")
        .arg(&worktree_path)
        .arg("log")
        .arg("-1")
        .arg("--format=%aI")
        .output()
        .ok()?;

    if output.status.success() {
        let timestamp = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if !timestamp.is_empty() {
            return Some(timestamp);
        }
    }

    None
}

/// Calculate git statistics for a workspace
fn get_git_stats(repo_path: &str, workspace_directory: &str) -> Option<(i64, i64)> {
    // Calculate worktree path
    let home_dir = dirs::home_dir()?;
    let repo_name = Path::new(repo_path).file_name()?.to_str()?;
    let worktree_path = home_dir
        .join("letsvibe-workspaces")
        .join(repo_name)
        .join(workspace_directory);

    if !worktree_path.exists() {
        return None;
    }

    // Get the parent branch (initialization_parent_branch) for comparison
    // For now, we'll use HEAD to compare against the working tree changes
    let output = Command::new("git")
        .arg("-C")
        .arg(&worktree_path)
        .arg("diff")
        .arg("--numstat")
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let diff_output = String::from_utf8_lossy(&output.stdout);
    let mut total_insertions: i64 = 0;
    let mut total_deletions: i64 = 0;

    for line in diff_output.lines() {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            if let (Ok(insertions), Ok(deletions)) = (parts[0].parse::<i64>(), parts[1].parse::<i64>()) {
                total_insertions += insertions;
                total_deletions += deletions;
            }
        }
    }

    if total_insertions > 0 || total_deletions > 0 {
        Some((total_insertions, total_deletions))
    } else {
        None
    }
}

#[tauri::command]
pub async fn get_repositories(state: State<'_, AppState>) -> Result<Vec<RepoWithWorkspaces>, String> {
    let db = state.db.lock().await;
    let pool = db.as_ref().ok_or("Database not initialized")?;

    let repos: Vec<Repo> = sqlx::query_as("SELECT * FROM repos ORDER BY display_order, name")
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

    let mut result = Vec::new();
    for repo in repos {
        let mut workspaces: Vec<Workspace> = sqlx::query_as(
            "SELECT * FROM workspaces WHERE repository_id = ? ORDER BY updated_at DESC",
        )
        .bind(&repo.id)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

        // Populate git statistics and last active time for each workspace
        if let Some(repo_path) = &repo.root_path {
            for workspace in &mut workspaces {
                if let Some(directory_name) = &workspace.directory_name {
                    // Get git statistics
                    if let Some((insertions, deletions)) = get_git_stats(repo_path, directory_name) {
                        workspace.git_insertions = Some(insertions);
                        workspace.git_deletions = Some(deletions);
                    }

                    // Get last active time
                    if let Some(last_active) = get_last_active_time(repo_path, directory_name) {
                        workspace.updated_at = last_active;
                    }
                }
            }
        }

        result.push(RepoWithWorkspaces { repo, workspaces });
    }

    Ok(result)
}

#[tauri::command]
pub async fn create_repo(
    state: State<'_, AppState>,
    name: String,
    root_path: Option<String>,
    remote_url: Option<String>,
) -> Result<Repo, String> {
    let db = state.db.lock().await;
    let pool = db.as_ref().ok_or("Database not initialized")?;

    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        r#"
        INSERT INTO repos (id, name, root_path, remote_url)
        VALUES (?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&name)
    .bind(&root_path)
    .bind(&remote_url)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    let repo: Repo = sqlx::query_as("SELECT * FROM repos WHERE id = ?")
        .bind(&id)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(repo)
}

#[tauri::command]
pub async fn create_workspace(
    state: State<'_, AppState>,
    repository_id: String,
) -> Result<Workspace, String> {
    let db = state.db.lock().await;
    let pool = db.as_ref().ok_or("Database not initialized")?;

    // Get repository info
    let repo: Repo = sqlx::query_as("SELECT * FROM repos WHERE id = ?")
        .bind(&repository_id)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Repository not found: {}", e))?;

    let repo_path = repo
        .root_path
        .as_ref()
        .ok_or("Repository has no root path")?;

    // Get used place names for this repository
    let used_names: Vec<String> = sqlx::query_scalar(
        "SELECT directory_name FROM workspaces WHERE repository_id = ? AND directory_name IS NOT NULL",
    )
    .bind(&repository_id)
    .fetch_all(pool)
    .await
    .map_err(|e| e.to_string())?;

    // Try to create worktree with retry on conflict
    const MAX_RETRIES: usize = 3;
    let mut attempts = 0;
    let mut last_error = String::new();

    while attempts < MAX_RETRIES {
        // Select an available place name
        let place_name = select_available_name(&used_names)
            .ok_or("No available workspace names. All place names are in use.")?;

        // Calculate worktree path: ~/letsvibe-workspaces/<repo_name>/<place_name>
        let home_dir = dirs::home_dir().ok_or("Cannot determine home directory")?;
        let repo_name = Path::new(repo_path)
            .file_name()
            .and_then(|n| n.to_str())
            .ok_or("Cannot determine repository name")?;
        let worktree_base = home_dir.join("letsvibe-workspaces").join(repo_name);

        // Create base directory if it doesn't exist
        std::fs::create_dir_all(&worktree_base)
            .map_err(|e| format!("Failed to create worktree base directory: {}", e))?;

        let worktree_path = worktree_base.join(&place_name);

        // Check if directory already exists
        if worktree_path.exists() {
            attempts += 1;
            last_error = format!("Directory {} already exists", worktree_path.display());
            continue;
        }

        // Detect main branch name
        let main_branch = detect_main_branch(repo_path)?;

        // Create git worktree
        let output = Command::new("git")
            .arg("-C")
            .arg(repo_path)
            .arg("worktree")
            .arg("add")
            .arg("-b")
            .arg(&place_name)
            .arg(&worktree_path)
            .arg(&main_branch)
            .output()
            .map_err(|e| format!("Failed to execute git command: {}", e))?;

        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            attempts += 1;
            last_error = format!("Git worktree creation failed: {}", stderr);
            continue;
        }

        // Success! Create database record
        let id = uuid::Uuid::new_v4().to_string();

        sqlx::query(
            r#"
            INSERT INTO workspaces (id, repository_id, branch, directory_name, initialization_parent_branch)
            VALUES (?, ?, ?, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(&repository_id)
        .bind(&place_name)
        .bind(&place_name)
        .bind(&main_branch)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

        let workspace: Workspace = sqlx::query_as("SELECT * FROM workspaces WHERE id = ?")
            .bind(&id)
            .fetch_one(pool)
            .await
            .map_err(|e| e.to_string())?;

        return Ok(workspace);
    }

    Err(format!(
        "Failed to create workspace after {} attempts: {}",
        MAX_RETRIES, last_error
    ))
}

/// Detect the main branch name (main or master)
fn detect_main_branch(repo_path: &str) -> Result<String, String> {
    // Try to get default branch from remote
    let output = Command::new("git")
        .arg("-C")
        .arg(repo_path)
        .arg("symbolic-ref")
        .arg("refs/remotes/origin/HEAD")
        .output()
        .map_err(|e| format!("Failed to execute git command: {}", e))?;

    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout);
        // Extract branch name from "refs/remotes/origin/main"
        if let Some(branch) = result.trim().strip_prefix("refs/remotes/origin/") {
            return Ok(branch.to_string());
        }
    }

    // Fallback: check if main or master exists
    for branch in ["main", "master"] {
        let output = Command::new("git")
            .arg("-C")
            .arg(repo_path)
            .arg("rev-parse")
            .arg("--verify")
            .arg(format!("refs/heads/{}", branch))
            .output()
            .map_err(|e| format!("Failed to execute git command: {}", e))?;

        if output.status.success() {
            return Ok(branch.to_string());
        }
    }

    Err("Could not detect main branch. Neither 'main' nor 'master' exists.".to_string())
}

#[tauri::command]
pub async fn delete_repo(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().await;
    let pool = db.as_ref().ok_or("Database not initialized")?;

    // Delete associated workspaces first
    sqlx::query("DELETE FROM workspaces WHERE repository_id = ?")
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    sqlx::query("DELETE FROM repos WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn delete_workspace(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().await;
    let pool = db.as_ref().ok_or("Database not initialized")?;

    sqlx::query("DELETE FROM workspaces WHERE id = ?")
        .bind(&id)
        .execute(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(Debug, Clone, Serialize)]
pub struct FileItem {
    pub name: String,
    #[serde(rename = "type")]
    pub file_type: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<FileItem>>,
}

/// Read directory structure for a workspace
#[tauri::command]
pub async fn get_workspace_files(
    state: State<'_, AppState>,
    workspace_id: String,
) -> Result<Vec<FileItem>, String> {
    let db = state.db.lock().await;
    let pool = db.as_ref().ok_or("Database not initialized")?;

    // Get workspace info
    let workspace: Workspace = sqlx::query_as("SELECT * FROM workspaces WHERE id = ?")
        .bind(&workspace_id)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Workspace not found: {}", e))?;

    // Get repository info
    let repo_id = workspace
        .repository_id
        .ok_or("Workspace has no repository")?;
    let repo: Repo = sqlx::query_as("SELECT * FROM repos WHERE id = ?")
        .bind(&repo_id)
        .fetch_one(pool)
        .await
        .map_err(|e| format!("Repository not found: {}", e))?;

    let repo_path = repo.root_path.ok_or("Repository has no root path")?;
    let directory_name = workspace
        .directory_name
        .ok_or("Workspace has no directory name")?;

    // Calculate worktree path
    let home_dir = dirs::home_dir().ok_or("Cannot determine home directory")?;
    let repo_name = Path::new(&repo_path)
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("Cannot determine repository name")?;
    let worktree_path = home_dir
        .join("letsvibe-workspaces")
        .join(repo_name)
        .join(&directory_name);

    if !worktree_path.exists() {
        return Err(format!(
            "Workspace directory does not exist: {}",
            worktree_path.display()
        ));
    }

    // Read directory structure
    read_directory_structure(&worktree_path)
}

/// Recursively read directory structure
fn read_directory_structure(path: &Path) -> Result<Vec<FileItem>, String> {
    let mut items = Vec::new();

    let entries = std::fs::read_dir(path)
        .map_err(|e| format!("Failed to read directory {}: {}", path.display(), e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read entry: {}", e))?;
        let file_name = entry
            .file_name()
            .to_string_lossy()
            .to_string();

        // Skip hidden files and git directory
        if file_name.starts_with('.') {
            continue;
        }

        let metadata = entry
            .metadata()
            .map_err(|e| format!("Failed to get metadata: {}", e))?;

        if metadata.is_dir() {
            // For directories, we don't recursively load children yet
            // They will be loaded on demand when the user expands them
            items.push(FileItem {
                name: file_name,
                file_type: "folder".to_string(),
                children: Some(Vec::new()),
            });
        } else {
            items.push(FileItem {
                name: file_name,
                file_type: "file".to_string(),
                children: None,
            });
        }
    }

    // Sort: folders first, then files, both alphabetically
    items.sort_by(|a, b| {
        match (a.file_type.as_str(), b.file_type.as_str()) {
            ("folder", "file") => std::cmp::Ordering::Less,
            ("file", "folder") => std::cmp::Ordering::Greater,
            _ => a.name.cmp(&b.name),
        }
    });

    Ok(items)
}
