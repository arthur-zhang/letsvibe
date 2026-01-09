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
        let workspaces: Vec<Workspace> = sqlx::query_as(
            "SELECT * FROM workspaces WHERE repository_id = ? ORDER BY updated_at DESC",
        )
        .bind(&repo.id)
        .fetch_all(pool)
        .await
        .map_err(|e| e.to_string())?;

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
