export interface Workspace {
  id: string;
  repository_id: string | null;
  branch: string | null;
  directory_name: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
  git_insertions?: number;
  git_deletions?: number;
}
