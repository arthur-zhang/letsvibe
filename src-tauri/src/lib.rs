mod commands;
mod db;

use std::path::PathBuf;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;

pub use db::models;
pub use db::DbPool;

pub struct AppState {
    pub db: Arc<Mutex<Option<DbPool>>>,
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

fn get_db_path(app: &tauri::AppHandle) -> PathBuf {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .expect("Failed to get app data directory");
    std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
    app_data_dir.join("letsvibe.db")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let app_handle = app.handle().clone();
            let state = AppState {
                db: Arc::new(Mutex::new(None)),
            };
            app.manage(state);

            // Initialize database in background
            let db_arc = app.state::<AppState>().db.clone();
            tauri::async_runtime::spawn(async move {
                let db_path = get_db_path(&app_handle);
                match db::init_pool(&db_path).await {
                    Ok(pool) => {
                        let mut db = db_arc.lock().await;
                        *db = Some(pool);
                        println!("Database initialized at: {:?}", db_path);
                    }
                    Err(e) => {
                        eprintln!("Failed to initialize database: {}", e);
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::get_repositories,
            commands::create_repo,
            commands::create_workspace,
            commands::delete_repo,
            commands::delete_workspace,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
