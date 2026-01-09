<script setup lang="ts">
import { ref, onMounted } from "vue";
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import FileTree from './components/FileTree.vue';
import CodeViewer from './components/CodeViewer.vue';

interface Workspace {
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

interface Repo {
  id: string;
  name: string | null;
  remote_url: string | null;
  root_path: string | null;
  default_branch: string | null;
}

interface RepoWithWorkspaces {
  id: string;
  name: string | null;
  remote_url: string | null;
  root_path: string | null;
  default_branch: string | null;
  workspaces: Workspace[];
}

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
}

interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
}

const repositories = ref<RepoWithWorkspaces[]>([]);
const openFiles = ref<OpenFile[]>([]);
const activeFileId = ref<string | null>(null);

const isLoading = ref<boolean>(true);

const loadRepositories = async () => {
  try {
    isLoading.value = true;
    const repos = await invoke<RepoWithWorkspaces[]>('get_repositories');
    repositories.value = repos;

    // Auto-select the first workspace if available
    // Try each workspace until one successfully loads
    if (repos.length > 0) {
      for (const repo of repos) {
        if (repo.workspaces && repo.workspaces.length > 0) {
          for (const workspace of repo.workspaces) {
            await selectWorkspace(workspace.id);
            // Check if files were successfully loaded
            if (files.value.length > 0) {
              console.log(`Successfully auto-selected workspace: ${workspace.id}`);
              return;
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to load repositories:', error);
    terminalOutput.value.push(`✗ Error loading repositories: ${error}`);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  // Give the database time to initialize, then load
  setTimeout(loadRepositories, 500);
});

const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const files = ref<FileItem[]>([]);

const terminalOutput = ref<string[]>([
  '$ npm run dev',
  'VITE v6.0.3  ready in 234 ms',
  '➜  Local:   http://localhost:5173/',
  '➜  Network: use --host to expose',
]);

const selectedWorkspace = ref<string>('2-1');
const showTerminal = ref<boolean>(true);
const activeRepoMenu = ref<string | null>(null);
const showAddMenu = ref<boolean>(false);
const showCloneModal = ref<boolean>(false);
const cloneUrl = ref<string>('');
const collapsedRepos = ref<Set<string>>(new Set());
const hoveredRepo = ref<string | null>(null);

const selectWorkspace = async (workspaceId: string) => {
  selectedWorkspace.value = workspaceId;

  console.log('Selecting workspace:', workspaceId);

  await loadWorkspaceFiles(workspaceId);
};

const loadWorkspaceFiles = async (workspaceId: string) => {
  // Load workspace files
  try {
    console.log('Calling get_workspace_files...');
    const workspaceFiles = await invoke<FileItem[]>('get_workspace_files', {
      workspaceId,
    });
    console.log('Received workspace files:', workspaceFiles);
    files.value = workspaceFiles;
    terminalOutput.value.push(`✓ Loaded ${workspaceFiles.length} items from workspace`);
  } catch (error) {
    console.error('Failed to load workspace files:', error);
    terminalOutput.value.push(`✗ Error loading workspace files: ${error}`);
    // Reset to empty on error
    files.value = [];
  }
};

const refreshFiles = async () => {
  if (selectedWorkspace.value) {
    terminalOutput.value.push('↻ Refreshing files...');
    await loadWorkspaceFiles(selectedWorkspace.value);
  }
};

const openFile = async (path: string, name: string) => {
  if (!selectedWorkspace.value) return;

  const fileId = `${selectedWorkspace.value}:${path}`;

  // Check if file is already open
  const existingFile = openFiles.value.find(f => f.id === fileId);
  if (existingFile) {
    activeFileId.value = fileId;
    return;
  }

  // Load file content
  try {
    const content = await invoke<string>('read_file_content', {
      workspaceId: selectedWorkspace.value,
      filePath: path,
    });

    openFiles.value.push({
      id: fileId,
      name,
      path,
      content,
    });
    activeFileId.value = fileId;
  } catch (error) {
    console.error('Failed to load file:', error);
    terminalOutput.value.push(`✗ Error loading file: ${error}`);
  }
};

const closeFile = (fileId: string) => {
  const index = openFiles.value.findIndex(f => f.id === fileId);
  if (index !== -1) {
    openFiles.value.splice(index, 1);

    // If closing active file, switch to another or clear
    if (activeFileId.value === fileId) {
      activeFileId.value = openFiles.value.length > 0
        ? openFiles.value[openFiles.value.length - 1].id
        : null;
    }
  }
};

const getActiveFile = () => {
  return openFiles.value.find(f => f.id === activeFileId.value);
};

const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content);
    terminalOutput.value.push('✓ Copied to clipboard');
  } catch (error) {
    console.error('Failed to copy:', error);
    terminalOutput.value.push(`✗ Failed to copy: ${error}`);
  }
};

const openAddMenu = () => {
  showAddMenu.value = true;
};

const closeAddMenu = () => {
  showAddMenu.value = false;
};

const toggleRepoMenu = (repoId: string) => {
  if (activeRepoMenu.value === repoId) {
    activeRepoMenu.value = null;
  } else {
    activeRepoMenu.value = repoId;
  }
};

const closeRepoMenu = () => {
  activeRepoMenu.value = null;
};

const createNewWorkspace = async (repoId: string) => {
  const repo = repositories.value.find(r => r.id === repoId);
  if (repo) {
    try {
      const workspace = await invoke<Workspace>('create_workspace', {
        repositoryId: repoId,
      });
      repo.workspaces.push(workspace);
      terminalOutput.value.push(`✓ Created workspace "${workspace.directory_name}" in ${repo.name}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      terminalOutput.value.push(`✗ Error: ${error}`);
    }
  }
};

const openProject = async () => {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Project Directory',
    });

    if (selected) {
      const path = selected as string;
      const projectName = path.split('/').pop() || 'Unknown Project';

      const newRepo = await invoke<Repo>('create_repo', {
        name: projectName,
        rootPath: path,
        remoteUrl: null,
      });

      repositories.value.push({
        ...newRepo,
        workspaces: [],
      });
      closeAddMenu();
      closeRepoMenu();

      terminalOutput.value.push(`✓ Added repository: ${projectName}`);
      terminalOutput.value.push(`  Path: ${path}`);
    }
  } catch (error) {
    console.error('Error opening directory:', error);
    terminalOutput.value.push(`✗ Error: ${error}`);
  }
};

const openCloneModal = () => {
  closeAddMenu();
  closeRepoMenu();
  showCloneModal.value = true;
};

const closeCloneModal = () => {
  showCloneModal.value = false;
  cloneUrl.value = '';
};

const quickStart = () => {
  terminalOutput.value.push('Quick start feature coming soon...');
  closeAddMenu();
};

const toggleRepoCollapse = (repoId: string) => {
  if (collapsedRepos.value.has(repoId)) {
    collapsedRepos.value.delete(repoId);
  } else {
    collapsedRepos.value.add(repoId);
  }
};

const cloneRepository = async () => {
  if (!cloneUrl.value.trim()) {
    return;
  }

  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'Select Clone Destination',
    });

    if (selected) {
      const path = selected as string;
      terminalOutput.value.push(`$ git clone ${cloneUrl.value} ${path}`);
      terminalOutput.value.push(`Cloning into '${path}'...`);

      const repoName = cloneUrl.value.split('/').pop()?.replace('.git', '') || 'repository';

      const newRepo = await invoke<Repo>('create_repo', {
        name: repoName,
        rootPath: path,
        remoteUrl: cloneUrl.value,
      });

      repositories.value.push({
        ...newRepo,
        workspaces: [],
      });
      closeCloneModal();

      terminalOutput.value.push(`✓ Repository cloned successfully`);
    }
  } catch (error) {
    console.error('Error cloning repository:', error);
    terminalOutput.value.push(`✗ Error: ${error}`);
  }
};
</script>

<template>
  <div class="flex h-screen bg-[#1a1a1a] text-[#e0e0e0] overflow-hidden">
    <!-- Left Sidebar - Repositories & Workspaces -->
    <div class="w-72 bg-[#1e1e1e] border-r border-[#333] flex flex-col">
      <!-- Repository List -->
      <div class="flex-1 overflow-y-auto">
        <!-- Workspaces Header (Top Entry) -->
        <div class="px-4 py-3 border-b border-[#333] flex items-center cursor-pointer hover:bg-[#252525]">
          <svg class="w-4 h-4 mr-2 text-[#808080]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
          </svg>
          <span class="text-sm font-medium text-[#e0e0e0]">Workspaces</span>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <span class="text-sm text-[#808080]">Loading...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="repositories.length === 0" class="px-4 py-8 text-center">
          <p class="text-sm text-[#808080] mb-2">No repositories yet</p>
          <p class="text-xs text-[#606060]">Click "Add" below to add a project</p>
        </div>

        <!-- Repository List -->
        <div
          v-else
          v-for="repo in repositories"
          :key="repo.id"
          class="border-b border-[#333]"
          @mouseenter="hoveredRepo = repo.id"
          @mouseleave="hoveredRepo = null"
        >
          <!-- Repository Header with Hover Actions -->
          <div class="relative px-4 py-3 flex items-center justify-between group">
            <h2 class="text-sm font-medium text-[#e0e0e0] flex-1 truncate">{{ repo.name }}</h2>

            <!-- Hover Actions -->
            <div
              v-if="hoveredRepo === repo.id"
              class="flex items-center space-x-1 ml-2"
            >
              <!-- Collapse Button -->
              <button
                @click.stop="toggleRepoCollapse(repo.id)"
                class="p-1 text-[#606060] hover:text-[#909090] hover:bg-[#2a2a2a] rounded transition-colors"
                :title="collapsedRepos.has(repo.id) ? 'Expand' : 'Collapse'"
              >
                <svg
                  class="w-4 h-4 transition-transform"
                  :class="{ 'rotate-180': collapsedRepos.has(repo.id) }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              <!-- Settings Button -->
              <button
                @click.stop="toggleRepoMenu(repo.id)"
                class="p-1 text-[#606060] hover:text-[#909090] hover:bg-[#2a2a2a] rounded transition-colors"
                title="Repository settings"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </button>
            </div>

            <!-- Dropdown Menu for repo actions -->
            <div
              v-if="activeRepoMenu === repo.id"
              class="absolute right-4 top-full mt-1 w-48 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <button
                @click="openProject"
                class="w-full flex items-center px-4 py-2 hover:bg-[#383838] transition-colors text-left text-sm"
              >
                <svg class="w-4 h-4 mr-3 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                </svg>
                <span class="text-[#d0d0d0]">Open project</span>
              </button>

              <button
                @click="openCloneModal"
                class="w-full flex items-center px-4 py-2 hover:bg-[#383838] transition-colors text-left text-sm"
              >
                <svg class="w-4 h-4 mr-3 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
                <span class="text-[#d0d0d0]">Clone from URL</span>
              </button>
            </div>
          </div>

          <!-- Collapsible Content -->
          <div v-if="!collapsedRepos.has(repo.id)">
            <!-- New Workspace Row -->
            <div class="relative flex items-center justify-between px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer">
              <button
                @click="createNewWorkspace(repo.id)"
                class="flex items-center text-[#808080] hover:text-[#b0b0b0] transition-colors"
              >
                <span class="text-lg mr-2">+</span>
                <span class="text-sm">New workspace</span>
              </button>
              <button
                @click.stop="toggleRepoMenu(repo.id)"
                class="text-[#606060] hover:text-[#909090] transition-colors p-1"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                </svg>
              </button>
            </div>

            <!-- Workspace List -->
            <div v-if="repo.workspaces.length > 0">
              <div
                v-for="workspace in repo.workspaces"
                :key="workspace.id"
                :class="[
                  'flex items-start px-4 py-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors',
                  selectedWorkspace === workspace.id ? 'bg-[#2a2a2a]' : ''
                ]"
                @click="selectWorkspace(workspace.id)"
              >
                <!-- Branch Icon -->
                <svg class="w-4 h-4 mt-0.5 mr-3 text-[#808080] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 17h.01M17 7a2 2 0 100-4 2 2 0 000 4zM7 11a4 4 0 010-8M7 21a4 4 0 010-8m10-6v14"></path>
                </svg>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-[#e0e0e0] truncate">{{ workspace.branch || 'No branch' }}</div>
                  <div class="text-xs text-[#707070] mt-0.5 flex items-center">
                    <span>{{ workspace.directory_name || repo.name }}</span>
                    <span class="mx-1">·</span>
                    <span>{{ formatTime(workspace.updated_at) }}</span>
                  </div>
                </div>
                <!-- Git Changes Indicator -->
                <div
                  v-if="workspace.git_insertions !== undefined || workspace.git_deletions !== undefined"
                  class="flex items-center space-x-2 ml-2 text-xs flex-shrink-0"
                >
                  <span v-if="workspace.git_insertions" class="text-[#4ade80]">+{{ workspace.git_insertions }}</span>
                  <span v-if="workspace.git_deletions" class="text-[#f87171]">-{{ workspace.git_deletions }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Bar with Add button and dropdown -->
      <div class="relative p-3 border-t border-[#333] flex items-center justify-between">
        <button
          @click="openAddMenu"
          class="flex items-center text-[#909090] hover:text-[#d0d0d0] transition-colors"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span class="text-sm">Add</span>
        </button>
        <div class="flex items-center space-x-3">
          <button class="text-[#606060] hover:text-[#909090] transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </button>
          <button class="text-[#606060] hover:text-[#909090] transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
          </button>
        </div>

        <!-- Dropdown Menu (appears above the Add button) -->
        <div
          v-if="showAddMenu"
          class="absolute left-2 right-2 bottom-full mb-2 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl z-50 overflow-hidden"
        >
          <button
            @click="openProject"
            class="w-full flex items-center px-4 py-3 hover:bg-[#383838] transition-colors text-left"
          >
            <svg class="w-5 h-5 mr-3 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
            </svg>
            <span class="text-[#d0d0d0]">Open project</span>
          </button>

          <button
            @click="openCloneModal"
            class="w-full flex items-center px-4 py-3 hover:bg-[#383838] transition-colors text-left"
          >
            <svg class="w-5 h-5 mr-3 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
            </svg>
            <span class="text-[#d0d0d0]">Clone from URL</span>
          </button>

          <button
            @click="quickStart"
            class="w-full flex items-center px-4 py-3 hover:bg-[#383838] transition-colors text-left"
          >
            <svg class="w-5 h-5 mr-3 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            <span class="text-[#d0d0d0]">Quick start</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- File Tabs -->
      <div v-if="openFiles.length > 0" class="flex items-center bg-[#252525] border-b border-[#333] overflow-x-auto">
        <div
          v-for="file in openFiles"
          :key="file.id"
          :class="[
            'flex items-center px-4 py-2 border-r border-[#333] cursor-pointer text-sm group relative',
            activeFileId === file.id ? 'bg-[#1a1a1a]' : 'hover:bg-[#2d2d2d]'
          ]"
          @click="activeFileId = file.id"
        >
          <svg class="w-4 h-4 mr-2 text-[#909090]" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-[#c0c0c0]">{{ file.name }}</span>
          <button
            @click.stop="closeFile(file.id)"
            class="ml-2 p-0.5 hover:bg-[#383838] rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <svg class="w-3 h-3 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content Area with Terminal -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Main Content -->
        <div :class="showTerminal ? 'flex-1' : 'h-full'" class="overflow-auto">
          <!-- File Content View -->
          <div v-if="getActiveFile()" class="h-full flex flex-col bg-[#1a1a1a]">
            <!-- File Header -->
            <div class="px-4 py-2 border-b border-[#333] flex items-center justify-between bg-[#252525]">
              <span class="text-xs text-[#808080]">{{ getActiveFile()?.path }}</span>
              <button
                @click="copyToClipboard(getActiveFile()?.content || '')"
                class="p-1 hover:bg-[#383838] rounded transition-colors"
                title="Copy content"
              >
                <svg class="w-4 h-4 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
              </button>
            </div>

            <!-- File Content with Syntax Highlighting -->
            <CodeViewer
              :code="getActiveFile()?.content || ''"
              :filename="getActiveFile()?.name || ''"
            />
          </div>

          <!-- Welcome Screen -->
          <div v-else class="p-6">
            <div class="max-w-4xl mx-auto">
              <h1 class="text-3xl font-bold mb-4 text-[#e0e0e0]">Welcome to Conductor</h1>
              <p class="text-[#909090] mb-6">
                Select a file from the Explorer to view its content.
              </p>
            </div>
          </div>
        </div>

        <!-- Terminal Panel -->
        <div
          v-if="showTerminal"
          class="h-48 bg-[#1a1a1a] border-t border-[#333] flex flex-col"
        >
          <div class="h-8 bg-[#222] border-b border-[#333] flex items-center justify-between px-4">
            <div class="flex items-center space-x-4">
              <span class="text-xs font-semibold text-[#808080]">TERMINAL</span>
              <button class="text-xs text-[#606060] hover:text-[#909090]">bash</button>
            </div>
            <button
              @click="showTerminal = false"
              class="text-[#606060] hover:text-[#909090]"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-4 font-mono text-xs">
            <div v-for="(line, index) in terminalOutput" :key="index" class="text-[#b0b0b0]">
              {{ line }}
            </div>
            <div class="flex items-center mt-2">
              <span class="text-[#4ade80]">$</span>
              <span class="ml-2 text-[#b0b0b0]">|</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Sidebar - File Explorer -->
    <div class="w-64 bg-[#252525] border-l border-[#333] flex flex-col">
      <div class="p-4 border-b border-[#333] flex items-center justify-between">
        <h2 class="text-sm font-semibold text-[#808080] uppercase tracking-wider">Explorer</h2>
        <button
          v-if="selectedWorkspace"
          @click="refreshFiles"
          class="p-1 text-[#606060] hover:text-[#909090] hover:bg-[#2a2a2a] rounded transition-colors"
          title="Refresh files"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </button>
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <FileTree :items="files" @file-click="openFile" />
      </div>
    </div>
  </div>

  <!-- Toggle Terminal Button (when hidden) -->
  <button
    v-if="!showTerminal"
    @click="showTerminal = true"
    class="fixed bottom-4 right-4 px-4 py-2 bg-[#4a9eff] hover:bg-[#3d8ce6] rounded-lg shadow-lg text-sm font-medium transition-colors text-white"
  >
    Show Terminal
  </button>

  <!-- Overlay to close menu when clicking outside -->
  <div
    v-if="activeRepoMenu !== null || showAddMenu"
    class="fixed inset-0 z-40"
    @click="closeRepoMenu(); closeAddMenu()"
  ></div>

  <!-- Clone from URL Modal -->
  <div
    v-if="showCloneModal"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeCloneModal"
  >
    <div class="bg-[#2a2a2a] rounded-lg border border-[#444] w-96 p-6">
      <h2 class="text-xl font-semibold mb-4 text-[#e0e0e0]">Clone from URL</h2>

      <div class="mb-4">
        <label class="block text-sm text-[#808080] mb-2">Repository URL</label>
        <input
          v-model="cloneUrl"
          type="text"
          placeholder="https://github.com/user/repo.git"
          class="w-full px-3 py-2 bg-[#1a1a1a] border border-[#444] rounded text-[#e0e0e0] placeholder-[#606060] focus:outline-none focus:border-[#4a9eff]"
          @keyup.enter="cloneRepository"
        />
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="closeCloneModal"
          class="px-4 py-2 text-sm text-[#909090] hover:text-[#d0d0d0] transition-colors"
        >
          Cancel
        </button>
        <button
          @click="cloneRepository"
          :disabled="!cloneUrl.trim()"
          class="px-4 py-2 bg-[#4a9eff] hover:bg-[#3d8ce6] rounded text-sm font-medium transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clone
        </button>
      </div>
    </div>
  </div>
</template>

<style>
/* Global scrollbar styling - dark theme, vertical visible, horizontal hidden */
* {
  scrollbar-width: thin; /* Firefox - thin scrollbar */
  scrollbar-color: #3a3a3a #252525; /* Firefox - thumb and track colors */
}

/* Webkit browsers (Chrome, Safari, Edge) */
*::-webkit-scrollbar {
  width: 12px; /* Vertical scrollbar width */
  height: 0; /* Hide horizontal scrollbar */
}

*::-webkit-scrollbar-track {
  background: #252525; /* Track color - darker background */
}

*::-webkit-scrollbar-thumb {
  background: #3a3a3a; /* Thumb color - medium gray */
  border-radius: 6px;
  border: 2px solid #252525; /* Border to create padding effect */
}

*::-webkit-scrollbar-thumb:hover {
  background: #4a4a4a; /* Lighter gray on hover */
}

/* Hide horizontal scrollbar completely */
* {
  overflow-x: hidden;
}

/* Re-enable overflow-x for specific elements that need it */
.overflow-x-auto {
  overflow-x: auto !important;
}
</style>
