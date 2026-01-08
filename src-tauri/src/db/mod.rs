pub mod models;
pub mod schema;

use sqlx::{sqlite::SqlitePoolOptions, SqlitePool};
use std::path::Path;

pub type DbPool = SqlitePool;

/// Initialize the database connection pool
pub async fn init_pool(db_path: &Path) -> Result<DbPool, sqlx::Error> {
    let db_url = format!("sqlite:{}?mode=rwc", db_path.display());

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect(&db_url)
        .await?;

    // Run schema initialization
    schema::init_schema(&pool).await?;

    Ok(pool)
}
