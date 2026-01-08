use crate::db::models::{Repo, Workspace};
use crate::AppState;
use serde::Serialize;
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
    branch: Option<String>,
    directory_name: Option<String>,
) -> Result<Workspace, String> {
    let db = state.db.lock().await;
    let pool = db.as_ref().ok_or("Database not initialized")?;

    let id = uuid::Uuid::new_v4().to_string();

    sqlx::query(
        r#"
        INSERT INTO workspaces (id, repository_id, branch, directory_name)
        VALUES (?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&repository_id)
    .bind(&branch)
    .bind(&directory_name)
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;

    let workspace: Workspace = sqlx::query_as("SELECT * FROM workspaces WHERE id = ?")
        .bind(&id)
        .fetch_one(pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(workspace)
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
