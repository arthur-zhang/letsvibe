import type { Workspace } from './workspace';

export interface Repo {
  id: string;
  name: string | null;
  remote_url: string | null;
  root_path: string | null;
  default_branch: string | null;
  display_order: number | null;
  created_at: string;
  updated_at: string;
}

export interface RepoWithWorkspaces extends Repo {
  workspaces: Workspace[];
}
