<script setup lang="ts">
import { ref } from "vue";
import { open } from '@tauri-apps/plugin-dialog';

interface Workspace {
  id: string;
  branchName: string;
  repoName: string;
  lastActive: string;
}

interface Repository {
  id: string;
  name: string;
  workspaces: Workspace[];
}

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
}

const repositories = ref<Repository[]>([
  {
    id: '1',
    name: 'open-waf',
    workspaces: []
  },
  {
    id: '2',
    name: 'vibe-master',
    workspaces: [
      { id: '2-1', branchName: 'arthur-zhang/montre...', repoName: 'montreal-v1', lastActive: '24m ago' }
    ]
  },
  {
    id: '3',
    name: 'autoglm-rs',
    workspaces: []
  },
  {
    id: '4',
    name: 'sarmor-edge',
    workspaces: [
      { id: '4-1', branchName: 'arthur-zhang/machu...', repoName: 'machu-picchu', lastActive: '4d ago' },
      { id: '4-2', branchName: 'arthur-zhang/fw-revi...', repoName: 'curitiba', lastActive: '4d ago' }
    ]
  }
]);

const files = ref<FileItem[]>([
  {
    name: 'src',
    type: 'folder',
    children: [
      { name: 'App.vue', type: 'file' },
      { name: 'main.ts', type: 'file' },
      { name: 'index.css', type: 'file' },
    ]
  },
  {
    name: 'public',
    type: 'folder',
    children: [
      { name: 'vite.svg', type: 'file' },
    ]
  },
  { name: 'package.json', type: 'file' },
  { name: 'tailwind.config.js', type: 'file' },
  { name: 'tsconfig.json', type: 'file' },
]);

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

const createNewWorkspace = (repoId: string) => {
  const repo = repositories.value.find(r => r.id === repoId);
  if (repo) {
    const newWorkspace: Workspace = {
      id: `${repoId}-${Date.now()}`,
      branchName: 'new-branch',
      repoName: repo.name,
      lastActive: 'just now'
    };
    repo.workspaces.push(newWorkspace);
    terminalOutput.value.push(`✓ Created new workspace in ${repo.name}`);
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

      const newRepo: Repository = {
        id: Date.now().toString(),
        name: projectName,
        workspaces: []
      };

      repositories.value.push(newRepo);
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

      const newRepo: Repository = {
        id: Date.now().toString(),
        name: repoName,
        workspaces: []
      };

      repositories.value.push(newRepo);
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
        <div
          v-for="repo in repositories"
          :key="repo.id"
          class="border-b border-[#333]"
        >
          <!-- Repository Header -->
          <div class="px-4 py-3">
            <h2 class="text-sm font-medium text-[#e0e0e0]">{{ repo.name }}</h2>
          </div>

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

            <!-- Dropdown Menu for repo actions -->
            <div
              v-if="activeRepoMenu === repo.id"
              class="absolute right-0 top-full mt-1 w-48 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-xl z-50 overflow-hidden"
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

          <!-- Workspace List -->
          <div v-if="repo.workspaces.length > 0">
            <div
              v-for="workspace in repo.workspaces"
              :key="workspace.id"
              :class="[
                'flex items-start px-4 py-3 cursor-pointer hover:bg-[#2a2a2a] transition-colors',
                selectedWorkspace === workspace.id ? 'bg-[#2a2a2a]' : ''
              ]"
              @click="selectedWorkspace = workspace.id"
            >
              <!-- Branch Icon -->
              <svg class="w-4 h-4 mt-0.5 mr-3 text-[#808080] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 17h.01M17 7a2 2 0 100-4 2 2 0 000 4zM7 11a4 4 0 010-8M7 21a4 4 0 010-8m10-6v14"></path>
              </svg>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-[#e0e0e0] truncate">{{ workspace.branchName }}</div>
                <div class="text-xs text-[#707070] mt-0.5">
                  {{ workspace.repoName }} · {{ workspace.lastActive }}
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
      <!-- Top Bar -->
      <div class="h-12 bg-[#252525] border-b border-[#333] flex items-center px-4">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-[#909090]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
          </svg>
          <span class="text-sm font-medium text-[#d0d0d0]">letsvibe/dakar</span>
          <span class="text-xs text-[#606060]">•</span>
          <span class="text-xs text-[#808080]">arthur-zhang/conductor-layout</span>
        </div>
      </div>

      <!-- Content Area with Terminal -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Main Content -->
        <div :class="showTerminal ? 'flex-1' : 'h-full'" class="overflow-auto">
          <div class="p-6">
            <div class="max-w-4xl mx-auto">
              <h1 class="text-3xl font-bold mb-4 text-[#e0e0e0]">Welcome to Conductor</h1>
              <p class="text-[#909090] mb-6">
                A powerful workspace manager for your development projects. Select a workspace from the left sidebar to get started.
              </p>

              <div class="bg-[#252525] rounded-lg p-6 border border-[#333]">
                <h2 class="text-xl font-semibold mb-3 text-[#d0d0d0]">Current Workspace</h2>
                <div class="space-y-2 text-sm">
                  <div class="flex">
                    <span class="text-[#808080] w-24">Project:</span>
                    <span class="text-[#d0d0d0]">letsvibe/dakar</span>
                  </div>
                  <div class="flex">
                    <span class="text-[#808080] w-24">Branch:</span>
                    <span class="text-[#4a9eff]">arthur-zhang/conductor-layout</span>
                  </div>
                  <div class="flex">
                    <span class="text-[#808080] w-24">Status:</span>
                    <span class="text-[#4ade80]">Active</span>
                  </div>
                </div>
              </div>

              <div class="mt-6 grid grid-cols-2 gap-4">
                <div class="bg-[#252525] rounded-lg p-4 border border-[#333]">
                  <h3 class="text-sm font-semibold text-[#808080] mb-2">Quick Actions</h3>
                  <div class="space-y-2">
                    <button class="w-full text-left px-3 py-2 bg-[#2d2d2d] hover:bg-[#383838] rounded text-sm transition-colors text-[#d0d0d0]">
                      Run Build
                    </button>
                    <button class="w-full text-left px-3 py-2 bg-[#2d2d2d] hover:bg-[#383838] rounded text-sm transition-colors text-[#d0d0d0]">
                      Run Tests
                    </button>
                    <button class="w-full text-left px-3 py-2 bg-[#2d2d2d] hover:bg-[#383838] rounded text-sm transition-colors text-[#d0d0d0]">
                      Git Status
                    </button>
                  </div>
                </div>

                <div class="bg-[#252525] rounded-lg p-4 border border-[#333]">
                  <h3 class="text-sm font-semibold text-[#808080] mb-2">Recent Activity</h3>
                  <div class="space-y-2 text-xs text-[#808080]">
                    <div>• Installed Tailwind CSS</div>
                    <div>• Created layout components</div>
                    <div>• Updated configuration</div>
                  </div>
                </div>
              </div>
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
      <div class="p-4 border-b border-[#333]">
        <h2 class="text-sm font-semibold text-[#808080] uppercase tracking-wider">Explorer</h2>
      </div>
      <div class="flex-1 overflow-y-auto p-2">
        <FileTree :items="files" />
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

<script lang="ts">
import { defineComponent, type PropType } from 'vue';

interface FileItemType {
  name: string;
  type: 'file' | 'folder';
  children?: FileItemType[];
}

const FileTree = defineComponent({
  name: 'FileTree',
  props: {
    items: {
      type: Array as PropType<FileItemType[]>,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      expandedFolders: new Set(['src', 'public'])
    };
  },
  methods: {
    toggleFolder(name: string) {
      if (this.expandedFolders.has(name)) {
        this.expandedFolders.delete(name);
      } else {
        this.expandedFolders.add(name);
      }
    }
  },
  template: `
    <div>
      <div
        v-for="item in items"
        :key="item.name"
        class="select-none"
      >
        <div
          :class="[
            'flex items-center px-2 py-1 hover:bg-[#2d2d2d] rounded cursor-pointer text-sm',
          ]"
          :style="{ paddingLeft: (level * 12 + 8) + 'px' }"
          @click="item.type === 'folder' ? toggleFolder(item.name) : null"
        >
          <svg
            v-if="item.type === 'folder'"
            class="w-4 h-4 mr-2 text-[#909090] transition-transform"
            :class="{ 'rotate-90': expandedFolders.has(item.name) }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <svg
            v-if="item.type === 'folder'"
            class="w-4 h-4 mr-2 text-[#4a9eff]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path>
          </svg>
          <svg
            v-else
            class="w-4 h-4 mr-2 text-[#909090]"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd"></path>
          </svg>
          <span class="text-[#c0c0c0]">{{ item.name }}</span>
        </div>
        <FileTree
          v-if="item.type === 'folder' && item.children && expandedFolders.has(item.name)"
          :items="item.children"
          :level="level + 1"
        />
      </div>
    </div>
  `,
});

export default {
  components: {
    FileTree,
  },
};
</script>
