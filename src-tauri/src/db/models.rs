use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Attachment {
    pub id: String,
    #[sqlx(rename = "type")]
    pub attachment_type: Option<String>,
    pub original_name: Option<String>,
    pub path: Option<String>,
    pub is_loading: Option<i64>,
    pub session_id: Option<String>,
    pub session_message_id: Option<String>,
    pub is_draft: Option<i64>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct DiffComment {
    pub id: String,
    pub workspace_id: Option<String>,
    pub file_path: Option<String>,
    pub line_number: Option<i64>,
    pub body: Option<String>,
    pub state: Option<String>,
    pub location: Option<String>,
    pub created_at: i64,
    pub remote_url: Option<String>,
    pub author: Option<String>,
    pub thread_id: Option<String>,
    pub reply_to_comment_id: Option<String>,
    pub update_memory: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Repo {
    pub id: String,
    pub remote_url: Option<String>,
    pub name: Option<String>,
    pub default_branch: Option<String>,
    pub root_path: Option<String>,
    pub setup_script: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub storage_version: Option<i64>,
    pub archive_script: Option<String>,
    pub display_order: Option<i64>,
    pub run_script: Option<String>,
    pub run_script_mode: Option<String>,
    pub remote: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct SessionMessage {
    pub id: String,
    pub session_id: Option<String>,
    pub role: Option<String>,
    pub content: Option<String>,
    pub created_at: String,
    pub sent_at: Option<String>,
    pub full_message: Option<String>,
    pub cancelled_at: Option<String>,
    pub model: Option<String>,
    pub sdk_message_id: Option<String>,
    pub last_assistant_message_id: Option<String>,
    pub turn_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Session {
    pub id: String,
    pub status: Option<String>,
    pub claude_session_id: Option<String>,
    pub unread_count: Option<i64>,
    pub freshly_compacted: Option<i64>,
    pub context_token_count: Option<i64>,
    pub created_at: String,
    pub updated_at: String,
    pub is_compacting: Option<i64>,
    pub model: Option<String>,
    pub permission_mode: Option<String>,
    pub thinking_level: Option<String>,
    pub last_user_message_at: Option<String>,
    pub resume_session_at: Option<String>,
    pub workspace_id: Option<String>,
    pub is_hidden: Option<i64>,
    pub agent_type: Option<String>,
    pub title: Option<String>,
    pub context_used_percent: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Setting {
    pub key: String,
    pub value: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Workspace {
    pub id: String,
    pub repository_id: Option<String>,
    #[sqlx(rename = "DEPRECATED_city_name")]
    pub deprecated_city_name: Option<String>,
    pub directory_name: Option<String>,
    #[sqlx(rename = "DEPRECATED_archived")]
    pub deprecated_archived: Option<i64>,
    pub active_session_id: Option<String>,
    pub branch: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    pub unread: Option<i64>,
    pub placeholder_branch_name: Option<String>,
    pub state: Option<String>,
    pub initialization_parent_branch: Option<String>,
    pub big_terminal_mode: Option<i64>,
    pub setup_log_path: Option<String>,
    pub initialization_log_path: Option<String>,
    pub initialization_files_copied: Option<i64>,
    pub pinned_at: Option<String>,
    pub linked_workspace_ids: Option<String>,
    pub notes: Option<String>,
    pub intended_target_branch: Option<String>,
    #[sqlx(default)]
    pub git_insertions: Option<i64>,
    #[sqlx(default)]
    pub git_deletions: Option<i64>,
}
