use sqlx::SqlitePool;

/// Initialize database schema
pub async fn init_schema(pool: &SqlitePool) -> Result<(), sqlx::Error> {
    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS _sqlx_migrations (
            version        INTEGER PRIMARY KEY,
            description    TEXT NOT NULL,
            installed_on   TEXT DEFAULT (datetime('now')) NOT NULL,
            success        INTEGER NOT NULL,
            checksum       BLOB NOT NULL,
            execution_time INTEGER NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS attachments (
            id                 TEXT PRIMARY KEY,
            type               TEXT,
            original_name      TEXT,
            path               TEXT,
            is_loading         INTEGER DEFAULT 0,
            session_id         TEXT,
            session_message_id TEXT,
            is_draft           INTEGER DEFAULT 1,
            created_at         TEXT DEFAULT (datetime('now')) NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_attachments_is_draft
            ON attachments (is_draft)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_attachments_session_id
            ON attachments (session_id)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_attachments_session_message_id
            ON attachments (session_message_id)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS diff_comments (
            id                  TEXT PRIMARY KEY,
            workspace_id        TEXT,
            file_path           TEXT,
            line_number         INTEGER,
            body                TEXT,
            state               TEXT,
            location            TEXT,
            created_at          INTEGER NOT NULL,
            remote_url          TEXT,
            author              TEXT,
            thread_id           TEXT,
            reply_to_comment_id TEXT,
            update_memory       INTEGER
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_diff_comments_workspace
            ON diff_comments (workspace_id)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS repos (
            id              TEXT PRIMARY KEY,
            remote_url      TEXT,
            name            TEXT,
            default_branch  TEXT DEFAULT 'main',
            root_path       TEXT,
            setup_script    TEXT,
            created_at      TEXT DEFAULT (datetime('now')) NOT NULL,
            updated_at      TEXT DEFAULT (datetime('now')) NOT NULL,
            storage_version INTEGER DEFAULT 1,
            archive_script  TEXT,
            display_order   INTEGER DEFAULT 0,
            run_script      TEXT,
            run_script_mode TEXT DEFAULT 'concurrent',
            remote          TEXT
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS session_messages (
            id                        TEXT PRIMARY KEY,
            session_id                TEXT,
            role                      TEXT,
            content                   TEXT,
            created_at                TEXT DEFAULT (datetime('now')) NOT NULL,
            sent_at                   TEXT,
            full_message              TEXT,
            cancelled_at              TEXT,
            model                     TEXT,
            sdk_message_id            TEXT,
            last_assistant_message_id TEXT,
            turn_id                   TEXT
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_session_messages_cancelled_at
            ON session_messages (session_id, cancelled_at)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_session_messages_sent_at
            ON session_messages (session_id, sent_at)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_session_messages_turn_id
            ON session_messages (turn_id)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS sessions (
            id                   TEXT PRIMARY KEY,
            status               TEXT DEFAULT 'idle',
            claude_session_id    TEXT,
            unread_count         INTEGER DEFAULT 0,
            freshly_compacted    INTEGER DEFAULT 0,
            context_token_count  INTEGER DEFAULT 0,
            created_at           TEXT DEFAULT (datetime('now')) NOT NULL,
            updated_at           TEXT DEFAULT (datetime('now')) NOT NULL,
            is_compacting        INTEGER DEFAULT 0,
            model                TEXT,
            permission_mode      TEXT DEFAULT 'default',
            thinking_level       TEXT DEFAULT 'NONE',
            last_user_message_at TEXT,
            resume_session_at    TEXT,
            workspace_id         TEXT,
            is_hidden            INTEGER DEFAULT 0,
            agent_type           TEXT,
            title                TEXT DEFAULT 'Untitled',
            context_used_percent REAL
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE INDEX IF NOT EXISTS idx_sessions_workspace_id
            ON sessions (workspace_id)
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS settings (
            key        TEXT PRIMARY KEY,
            value      TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now')) NOT NULL,
            updated_at TEXT DEFAULT (datetime('now')) NOT NULL
        )
        "#,
    )
    .execute(pool)
    .await?;

    sqlx::query(
        r#"
        CREATE TABLE IF NOT EXISTS workspaces (
            id                           TEXT PRIMARY KEY,
            repository_id                TEXT,
            DEPRECATED_city_name         TEXT,
            directory_name               TEXT,
            DEPRECATED_archived          INTEGER DEFAULT 0,
            active_session_id            TEXT,
            branch                       TEXT,
            created_at                   TEXT DEFAULT (datetime('now')) NOT NULL,
            updated_at                   TEXT DEFAULT (datetime('now')) NOT NULL,
            unread                       INTEGER DEFAULT 0,
            placeholder_branch_name      TEXT,
            state                        TEXT DEFAULT 'active',
            initialization_parent_branch TEXT,
            big_terminal_mode            INTEGER DEFAULT 0,
            setup_log_path               TEXT,
            initialization_log_path      TEXT,
            initialization_files_copied  INTEGER,
            pinned_at                    TEXT,
            linked_workspace_ids         TEXT,
            notes                        TEXT,
            intended_target_branch       TEXT
        )
        "#,
    )
    .execute(pool)
    .await?;

    Ok(())
}
