create table main._sqlx_migrations
(
    version        BIGINT
        primary key,
    description    TEXT                                not null,
    installed_on   TIMESTAMP default CURRENT_TIMESTAMP not null,
    success        BOOLEAN                             not null,
    checksum       BLOB                                not null,
    execution_time BIGINT                              not null
);

create table main.attachments
(
    id                 TEXT
        primary key,
    type               TEXT,
    original_name      TEXT,
    path               TEXT,
    is_loading         INTEGER default 0,
    session_id         TEXT,
    session_message_id TEXT,
    is_draft           INTEGER default 1,
    created_at         TEXT    default (datetime('now')) not null
);

create index main.idx_attachments_is_draft
    on main.attachments (is_draft);

create index main.idx_attachments_session_id
    on main.attachments (session_id);

create index main.idx_attachments_session_message_id
    on main.attachments (session_message_id);

create table main.diff_comments
(
    id                  TEXT
        primary key,
    workspace_id        TEXT,
    file_path           TEXT,
    line_number         INTEGER,
    body                TEXT,
    state               TEXT,
    location            TEXT,
    created_at          INTEGER not null,
    remote_url          TEXT,
    author              TEXT,
    thread_id           TEXT,
    reply_to_comment_id TEXT,
    update_memory       INTEGER
);

create index main.idx_diff_comments_workspace
    on main.diff_comments (workspace_id);

create table main.repos
(
    id              TEXT
        primary key,
    remote_url      TEXT,
    name            TEXT,
    default_branch  TEXT    default 'main',
    root_path       TEXT,
    setup_script    TEXT,
    created_at      TEXT    default (datetime('now')) not null,
    updated_at      TEXT    default (datetime('now')) not null,
    storage_version INTEGER default 1,
    archive_script  TEXT,
    display_order   INTEGER default 0,
    run_script      TEXT,
    run_script_mode TEXT    default 'concurrent',
    remote          TEXT
);

create table main.session_messages
(
    id                        TEXT
        primary key,
    session_id                TEXT,
    role                      TEXT,
    content                   TEXT,
    created_at                TEXT default (datetime('now')) not null,
    sent_at                   TEXT,
    full_message              TEXT,
    cancelled_at              TEXT,
    model                     TEXT,
    sdk_message_id            TEXT,
    last_assistant_message_id TEXT,
    turn_id                   TEXT
);

create index main.idx_session_messages_cancelled_at
    on main.session_messages (session_id, cancelled_at);

create index main.idx_session_messages_sent_at
    on main.session_messages (session_id, sent_at);

create index main.idx_session_messages_turn_id
    on main.session_messages (turn_id);

create table main.sessions
(
    id                   TEXT
        primary key,
    status               TEXT    default 'idle',
    claude_session_id    TEXT,
    unread_count         INTEGER default 0,
    freshly_compacted    INTEGER default 0,
    context_token_count  INTEGER default 0,
    created_at           TEXT    default (datetime('now')) not null,
    updated_at           TEXT    default (datetime('now')) not null,
    is_compacting        INTEGER default 0,
    model                TEXT,
    permission_mode      TEXT    default 'default',
    thinking_level       TEXT    default 'NONE',
    last_user_message_at TEXT,
    resume_session_at    TEXT,
    workspace_id         TEXT,
    is_hidden            INTEGER default 0,
    agent_type,
    title                TEXT    default 'Untitled',
    context_used_percent FLOAT
);

create index main.idx_sessions_workspace_id
    on main.sessions (workspace_id);

create table main.settings
(
    key        TEXT
        primary key,
    value      TEXT                           not null,
    created_at TEXT default (datetime('now')) not null,
    updated_at TEXT default (datetime('now')) not null
);

create table main.sqlite_master
(
    type     TEXT,
    name     TEXT,
    tbl_name TEXT,
    rootpage INT,
    sql      TEXT
);

create table main.workspaces
(
    id                           TEXT
        primary key,
    repository_id                TEXT,
    DEPRECATED_city_name         TEXT,
    directory_name               TEXT,
    DEPRECATED_archived          INTEGER default 0,
    active_session_id            TEXT,
    branch                       TEXT,
    created_at                   TEXT    default (datetime('now')) not null,
    updated_at                   TEXT    default (datetime('now')) not null,
    unread                       INTEGER default 0,
    placeholder_branch_name      TEXT,
    state                        TEXT    default 'active',
    initialization_parent_branch TEXT,
    big_terminal_mode            INTEGER default 0,
    setup_log_path               TEXT,
    initialization_log_path      TEXT,
    initialization_files_copied  INTEGER,
    pinned_at                    TEXT,
    linked_workspace_ids         TEXT,
    notes                        TEXT,
    intended_target_branch       TEXT
);

