# Vue to React 完整重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将整个 Vue 3 前端完全迁移到 React 18，保持所有功能和 UI 风格不变

**Architecture:** 使用 React 18 + TypeScript + Hooks 替代 Vue 3 Composition API，采用 Context API 进行状态管理，使用 shadcn/ui 提供 UI 组件，保持现有的 Tailwind CSS 深色主题和 Tauri 后端不变。

**Tech Stack:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, react-syntax-highlighter, Tauri v2

---

## Phase 1: 项目基础搭建

### Task 1.1: 备份和清理 Vue 文件

**Files:**
- Move: `src/App.vue` → `src/App.vue.backup`
- Move: `src/components/FileTree.vue` → `src/components/FileTree.vue.backup`
- Move: `src/components/CodeViewer.vue` → `src/components/CodeViewer.vue.backup`
- Move: `src/main.ts` → `src/main.ts.backup`

**Step 1: 备份现有 Vue 文件**

```bash
mv src/App.vue src/App.vue.backup
mv src/components/FileTree.vue src/components/FileTree.vue.backup
mv src/components/CodeViewer.vue src/components/CodeViewer.vue.backup
mv src/main.ts src/main.ts.backup
```

**Step 2: 验证备份文件存在**

Run: `ls -la src/*.backup src/components/*.backup`
Expected: 列出所有备份文件

**Step 3: Commit 备份**

```bash
git add src/*.backup src/components/*.backup
git commit -m "backup: save Vue files before React migration"
```

---

### Task 1.2: 安装 React 依赖

**Files:**
- Modify: `package.json`

**Step 1: 移除 Vue 依赖**

```bash
npm uninstall vue prismjs
```

**Step 2: 安装 React 核心依赖**

```bash
npm install react@^18.2.0 react-dom@^18.2.0
```

**Step 3: 安装 React 开发依赖**

```bash
npm install -D @types/react@^18.2.0 @types/react-dom@^18.2.0 @vitejs/plugin-react@^4.2.0
```

**Step 4: 安装语法高亮库**

```bash
npm install react-syntax-highlighter@^15.5.0
npm install -D @types/react-syntax-highlighter@^15.5.0
```

**Step 5: 安装 shadcn/ui 依赖**

```bash
npm install class-variance-authority@^0.7.0 clsx@^2.0.0 tailwind-merge@^2.0.0 tailwindcss-animate@^1.0.7
npm install -D @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tabs @radix-ui/react-scroll-area @radix-ui/react-tooltip
```

**Step 6: 验证依赖安装**

Run: `npm list react react-dom react-syntax-highlighter`
Expected: 显示所有包及其版本

**Step 7: Commit 依赖更新**

```bash
git add package.json package-lock.json
git commit -m "deps: install React and remove Vue dependencies"
```

---

### Task 1.3: 配置 Vite 支持 React

**Files:**
- Modify: `vite.config.ts`

**Step 1: 更新 Vite 配置**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
});
```

**Step 2: 验证配置语法**

Run: `npx tsc --noEmit vite.config.ts`
Expected: 无错误

**Step 3: Commit Vite 配置**

```bash
git add vite.config.ts
git commit -m "config: update Vite to support React"
```

---

### Task 1.4: 更新 TypeScript 配置

**Files:**
- Modify: `tsconfig.json`

**Step 1: 更新 TypeScript 配置支持 React**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Step 2: 验证 TypeScript 配置**

Run: `npx tsc --noEmit`
Expected: 无错误（可能会有找不到源文件的警告，这是正常的）

**Step 3: Commit TypeScript 配置**

```bash
git add tsconfig.json
git commit -m "config: update tsconfig for React JSX support"
```

---

### Task 1.5: 初始化 shadcn/ui

**Files:**
- Create: `components.json`
- Modify: `tailwind.config.js`

**Step 1: 创建 shadcn/ui 配置文件**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Step 2: 更新 Tailwind 配置**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**Step 3: 更新全局 CSS 添加 CSS 变量**

修改 `src/index.css`，在文件开头添加：

```css
@layer base {
  :root {
    --background: 26 26 26;
    --foreground: 224 224 224;
    --card: 37 37 37;
    --card-foreground: 224 224 224;
    --popover: 42 42 42;
    --popover-foreground: 224 224 224;
    --primary: 74 158 255;
    --primary-foreground: 26 26 26;
    --secondary: 56 56 56;
    --secondary-foreground: 224 224 224;
    --muted: 56 56 56;
    --muted-foreground: 144 144 144;
    --accent: 56 56 56;
    --accent-foreground: 224 224 224;
    --destructive: 248 113 113;
    --destructive-foreground: 224 224 224;
    --border: 51 51 51;
    --input: 68 68 68;
    --ring: 74 158 255;
    --radius: 0.5rem;
  }
}
```

**Step 4: Commit shadcn/ui 配置**

```bash
git add components.json tailwind.config.js src/index.css
git commit -m "config: initialize shadcn/ui with dark theme"
```

---

### Task 1.6: 创建项目目录结构

**Files:**
- Create: `src/components/ui/.gitkeep`
- Create: `src/hooks/.gitkeep`
- Create: `src/contexts/.gitkeep`
- Create: `src/types/.gitkeep`
- Create: `src/lib/.gitkeep`

**Step 1: 创建目录结构**

```bash
mkdir -p src/components/ui
mkdir -p src/hooks
mkdir -p src/contexts
mkdir -p src/types
mkdir -p src/lib
touch src/components/ui/.gitkeep
touch src/hooks/.gitkeep
touch src/contexts/.gitkeep
touch src/types/.gitkeep
touch src/lib/.gitkeep
```

**Step 2: 验证目录结构**

Run: `tree -L 2 src`
Expected: 显示新的目录结构

**Step 3: Commit 目录结构**

```bash
git add src/components/ui/.gitkeep src/hooks/.gitkeep src/contexts/.gitkeep src/types/.gitkeep src/lib/.gitkeep
git commit -m "feat: create project directory structure"
```

---

## Phase 2: 核心基础设施

### Task 2.1: 创建 TypeScript 类型定义

**Files:**
- Create: `src/types/repository.ts`
- Create: `src/types/workspace.ts`
- Create: `src/types/file.ts`
- Create: `src/types/index.ts`

**Step 1: 创建仓库类型定义**

`src/types/repository.ts`:
```typescript
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
```

**Step 2: 创建工作区类型定义**

`src/types/workspace.ts`:
```typescript
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
```

**Step 3: 创建文件系统类型定义**

`src/types/file.ts`:
```typescript
export interface FileItem {
  name: string;
  path: string;
  is_directory: boolean;
  children?: FileItem[];
}

export interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
}
```

**Step 4: 创建类型索引文件**

`src/types/index.ts`:
```typescript
export type { Repo, RepoWithWorkspaces } from './repository';
export type { Workspace } from './workspace';
export type { FileItem, OpenFile } from './file';
```

**Step 5: 验证类型定义**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 6: Commit 类型定义**

```bash
git add src/types/
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 2.2: 创建工具函数库

**Files:**
- Create: `src/lib/utils.ts`

**Step 1: 创建 shadcn/ui 工具函数**

`src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function detectLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'json': 'json',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'less': 'less',
    'md': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'py': 'python',
    'rs': 'rust',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'sql': 'sql',
    'html': 'html',
    'xml': 'xml',
    'vue': 'vue',
    'go': 'go',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
  };

  return languageMap[ext] || 'text';
}
```

**Step 2: 验证工具函数**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit 工具函数**

```bash
git add src/lib/utils.ts
git commit -m "feat: add utility functions for shadcn/ui and language detection"
```

---

### Task 2.3: 创建 Tauri 命令 Hook

**Files:**
- Create: `src/hooks/useTauriCommand.ts`

**Step 1: 实现 useTauriCommand Hook**

`src/hooks/useTauriCommand.ts`:
```typescript
import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface UseTauriCommandOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useTauriCommand<T = any, Args extends any[] = any[]>(
  command: string,
  options?: UseTauriCommandOptions<T>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: Args) => {
      setLoading(true);
      setError(null);

      try {
        const result = await invoke<T>(command, args.length > 0 ? args[0] : {});
        setData(result);
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [command, options]
  );

  return { data, loading, error, execute };
}
```

**Step 2: 验证 Hook 类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit Tauri Hook**

```bash
git add src/hooks/useTauriCommand.ts
git commit -m "feat: add useTauriCommand hook for Tauri API calls"
```

---

### Task 2.4: 创建 AppContext

**Files:**
- Create: `src/contexts/AppContext.tsx`

**Step 1: 实现 AppContext**

`src/contexts/AppContext.tsx`:
```typescript
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { RepoWithWorkspaces, Workspace, FileItem, OpenFile } from '@/types';

interface AppContextType {
  // 数据状态
  repositories: RepoWithWorkspaces[];
  openFiles: OpenFile[];
  activeFileId: string | null;
  files: FileItem[];
  terminalOutput: string[];

  // UI 状态
  selectedWorkspace: string | null;
  showTerminal: boolean;
  isLoading: boolean;

  // 操作方法
  loadRepositories: () => Promise<void>;
  selectWorkspace: (id: string) => Promise<void>;
  openFile: (file: FileItem) => Promise<void>;
  closeFile: (id: string) => void;
  setActiveFile: (id: string) => void;
  createWorkspace: (repoId: string) => Promise<void>;
  cloneRepository: (url: string) => Promise<void>;
  openProject: () => Promise<void>;
  deleteRepository: (id: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  addTerminalOutput: (message: string, type?: 'success' | 'error' | 'info') => void;
  toggleTerminal: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories] = useState<RepoWithWorkspaces[]>([]);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '✓ Application initialized',
    '✓ Database connection established',
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [showTerminal, setShowTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const addTerminalOutput = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const prefix = type === 'success' ? '✓' : type === 'error' ? '✗' : '•';
    setTerminalOutput(prev => [...prev, `${prefix} ${message}`]);
  }, []);

  const loadRepositories = useCallback(async () => {
    try {
      setIsLoading(true);
      const repos = await invoke<RepoWithWorkspaces[]>('get_repositories');
      setRepositories(repos);
      addTerminalOutput('Repositories loaded successfully', 'success');
    } catch (error) {
      addTerminalOutput(`Failed to load repositories: ${error}`, 'error');
      console.error('Failed to load repositories:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addTerminalOutput]);

  const selectWorkspace = useCallback(async (id: string) => {
    try {
      setSelectedWorkspace(id);
      setFiles([]);
      setOpenFiles([]);
      setActiveFileId(null);

      const workspaceFiles = await invoke<FileItem[]>('get_workspace_files', { workspaceId: id });
      setFiles(workspaceFiles);
      addTerminalOutput(`Workspace ${id} selected`, 'success');
    } catch (error) {
      addTerminalOutput(`Failed to load workspace files: ${error}`, 'error');
      console.error('Failed to load workspace files:', error);
    }
  }, [addTerminalOutput]);

  const openFile = useCallback(async (file: FileItem) => {
    if (file.is_directory) return;

    // 检查文件是否已打开
    const existingFile = openFiles.find(f => f.path === file.path);
    if (existingFile) {
      setActiveFileId(existingFile.id);
      return;
    }

    try {
      const content = await invoke<string>('read_file_content', {
        workspaceId: selectedWorkspace,
        filePath: file.path,
      });

      const newFile: OpenFile = {
        id: `${Date.now()}-${file.path}`,
        name: file.name,
        path: file.path,
        content,
      };

      setOpenFiles(prev => [...prev, newFile]);
      setActiveFileId(newFile.id);
      addTerminalOutput(`Opened file: ${file.name}`, 'success');
    } catch (error) {
      addTerminalOutput(`Failed to open file: ${error}`, 'error');
      console.error('Failed to open file:', error);
    }
  }, [openFiles, selectedWorkspace, addTerminalOutput]);

  const closeFile = useCallback((id: string) => {
    setOpenFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) {
      setActiveFileId(prev => {
        const remainingFiles = openFiles.filter(f => f.id !== id);
        return remainingFiles.length > 0 ? remainingFiles[remainingFiles.length - 1].id : null;
      });
    }
  }, [activeFileId, openFiles]);

  const setActiveFile = useCallback((id: string) => {
    setActiveFileId(id);
  }, []);

  const createWorkspace = useCallback(async (repoId: string) => {
    try {
      await invoke<Workspace>('create_workspace', { repositoryId: repoId });
      await loadRepositories();
      addTerminalOutput('New workspace created', 'success');
    } catch (error) {
      addTerminalOutput(`Failed to create workspace: ${error}`, 'error');
      console.error('Failed to create workspace:', error);
    }
  }, [loadRepositories, addTerminalOutput]);

  const cloneRepository = useCallback(async (url: string) => {
    try {
      addTerminalOutput(`Cloning repository from ${url}...`, 'info');
      await invoke('clone_repository', { url });
      await loadRepositories();
      addTerminalOutput('Repository cloned successfully', 'success');
    } catch (error) {
      addTerminalOutput(`Failed to clone repository: ${error}`, 'error');
      console.error('Failed to clone repository:', error);
      throw error;
    }
  }, [loadRepositories, addTerminalOutput]);

  const openProject = useCallback(async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected) {
        const path = typeof selected === 'string' ? selected : selected[0];
        addTerminalOutput(`Opening project at ${path}...`, 'info');
        await invoke('open_project', { path });
        await loadRepositories();
        addTerminalOutput('Project opened successfully', 'success');
      }
    } catch (error) {
      addTerminalOutput(`Failed to open project: ${error}`, 'error');
      console.error('Failed to open project:', error);
    }
  }, [loadRepositories, addTerminalOutput]);

  const deleteRepository = useCallback(async (id: string) => {
    try {
      await invoke('delete_repo', { id });
      await loadRepositories();
      addTerminalOutput('Repository deleted', 'success');
    } catch (error) {
      addTerminalOutput(`Failed to delete repository: ${error}`, 'error');
      console.error('Failed to delete repository:', error);
    }
  }, [loadRepositories, addTerminalOutput]);

  const deleteWorkspace = useCallback(async (id: string) => {
    try {
      await invoke('delete_workspace', { id });
      await loadRepositories();
      if (selectedWorkspace === id) {
        setSelectedWorkspace(null);
        setFiles([]);
        setOpenFiles([]);
        setActiveFileId(null);
      }
      addTerminalOutput('Workspace deleted', 'success');
    } catch (error) {
      addTerminalOutput(`Failed to delete workspace: ${error}`, 'error');
      console.error('Failed to delete workspace:', error);
    }
  }, [loadRepositories, selectedWorkspace, addTerminalOutput]);

  const toggleTerminal = useCallback(() => {
    setShowTerminal(prev => !prev);
  }, []);

  // 初始化加载
  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  const value: AppContextType = {
    repositories,
    openFiles,
    activeFileId,
    files,
    terminalOutput,
    selectedWorkspace,
    showTerminal,
    isLoading,
    loadRepositories,
    selectWorkspace,
    openFile,
    closeFile,
    setActiveFile,
    createWorkspace,
    cloneRepository,
    openProject,
    deleteRepository,
    deleteWorkspace,
    addTerminalOutput,
    toggleTerminal,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

**Step 2: 验证 Context 类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit AppContext**

```bash
git add src/contexts/AppContext.tsx
git commit -m "feat: implement AppContext for global state management"
```

---

## Phase 3: 组件迁移

### Task 3.1: 安装 shadcn/ui 基础组件

**Files:**
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/dialog.tsx`
- Create: `src/components/ui/dropdown-menu.tsx`
- Create: `src/components/ui/tabs.tsx`
- Create: `src/components/ui/scroll-area.tsx`

**Step 1: 安装 Button 组件**

```bash
npx shadcn-ui@latest add button
```

**Step 2: 安装 Dialog 组件**

```bash
npx shadcn-ui@latest add dialog
```

**Step 3: 安装 Dropdown Menu 组件**

```bash
npx shadcn-ui@latest add dropdown-menu
```

**Step 4: 安装 Tabs 组件**

```bash
npx shadcn-ui@latest add tabs
```

**Step 5: 安装 ScrollArea 组件**

```bash
npx shadcn-ui@latest add scroll-area
```

**Step 6: 安装 Input 组件**

```bash
npx shadcn-ui@latest add input
```

**Step 7: 验证组件安装**

Run: `ls -la src/components/ui/`
Expected: 列出所有 UI 组件文件

**Step 8: Commit shadcn/ui 组件**

```bash
git add src/components/ui/
git commit -m "feat: add shadcn/ui base components"
```

---

### Task 3.2: 创建 FileTree 组件

**Files:**
- Create: `src/components/FileTree/FileTree.tsx`
- Create: `src/components/FileTree/FileTreeItem.tsx`

**Step 1: 创建 FileTreeItem 组件**

`src/components/FileTree/FileTreeItem.tsx`:
```typescript
import React, { useState } from 'react';
import type { FileItem } from '@/types';

interface FileTreeItemProps {
  item: FileItem;
  level: number;
  onFileClick: (file: FileItem) => void;
}

export function FileTreeItem({ item, level, onFileClick }: FileTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = () => {
    if (item.is_directory) {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(item);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-[#2a2a2a] cursor-pointer text-sm"
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {item.is_directory && (
          <span className="text-[#909090] w-4">
            {isExpanded ? '▾' : '▸'}
          </span>
        )}
        {!item.is_directory && <span className="w-4"></span>}
        <span className={item.is_directory ? 'text-[#4a9eff]' : 'text-[#e0e0e0]'}>
          {item.name}
        </span>
      </div>

      {item.is_directory && isExpanded && item.children && (
        <div>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              level={level + 1}
              onFileClick={onFileClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: 创建 FileTree 主组件**

`src/components/FileTree/FileTree.tsx`:
```typescript
import React from 'react';
import { FileTreeItem } from './FileTreeItem';
import type { FileItem } from '@/types';

interface FileTreeProps {
  items: FileItem[];
  onFileClick: (file: FileItem) => void;
}

export function FileTree({ items, onFileClick }: FileTreeProps) {
  if (items.length === 0) {
    return (
      <div className="p-4 text-sm text-[#606060] text-center">
        No files to display
      </div>
    );
  }

  return (
    <div className="text-sm">
      {items.map((item) => (
        <FileTreeItem
          key={item.path}
          item={item}
          level={0}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}
```

**Step 3: 验证组件类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 4: Commit FileTree 组件**

```bash
git add src/components/FileTree/
git commit -m "feat: implement FileTree component"
```

---

### Task 3.3: 创建 CodeViewer 组件

**Files:**
- Create: `src/components/CodeViewer/CodeViewer.tsx`

**Step 1: 创建 CodeViewer 组件**

`src/components/CodeViewer/CodeViewer.tsx`:
```typescript
import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { detectLanguage } from '@/lib/utils';

interface CodeViewerProps {
  content: string;
  fileName: string;
  filePath: string;
}

export function CodeViewer({ content, fileName, filePath }: CodeViewerProps) {
  const language = detectLanguage(fileName);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="px-4 py-2 border-b border-[#333] flex items-center justify-between">
        <div className="text-sm text-[#909090]">{filePath}</div>
      </div>

      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            background: '#1e1e1e',
            fontSize: '13px',
            padding: '16px',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: '#858585',
            textAlign: 'right',
            userSelect: 'none',
          }}
          wrapLongLines
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
```

**Step 2: 验证组件类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit CodeViewer 组件**

```bash
git add src/components/CodeViewer/
git commit -m "feat: implement CodeViewer component with syntax highlighting"
```

---

### Task 3.4: 创建 Terminal 组件

**Files:**
- Create: `src/components/Terminal/Terminal.tsx`

**Step 1: 创建 Terminal 组件**

`src/components/Terminal/Terminal.tsx`:
```typescript
import React from 'react';
import { useApp } from '@/contexts/AppContext';

export function Terminal() {
  const { terminalOutput, showTerminal, toggleTerminal } = useApp();

  return (
    <div className="border-t border-[#333] bg-[#1e1e1e] flex flex-col">
      <div
        className="px-4 py-2 border-b border-[#333] flex items-center justify-between cursor-pointer hover:bg-[#252525]"
        onClick={toggleTerminal}
      >
        <span className="text-sm text-[#e0e0e0] font-medium">Terminal</span>
        <span className="text-[#909090] text-xs">
          {showTerminal ? '▾' : '▸'}
        </span>
      </div>

      {showTerminal && (
        <div className="flex-1 overflow-auto p-4 font-mono text-xs">
          {terminalOutput.map((line, index) => (
            <div
              key={index}
              className={
                line.startsWith('✓')
                  ? 'text-[#4ade80]'
                  : line.startsWith('✗')
                  ? 'text-[#f87171]'
                  : 'text-[#909090]'
              }
            >
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 2: 验证组件类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit Terminal 组件**

```bash
git add src/components/Terminal/
git commit -m "feat: implement Terminal component"
```

---

### Task 3.5: 创建 FileTabs 组件

**Files:**
- Create: `src/components/FileTabs/FileTabs.tsx`

**Step 1: 创建 FileTabs 组件**

`src/components/FileTabs/FileTabs.tsx`:
```typescript
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CodeViewer } from '@/components/CodeViewer/CodeViewer';
import { useApp } from '@/contexts/AppContext';

export function FileTabs() {
  const { openFiles, activeFileId, setActiveFile, closeFile } = useApp();

  if (openFiles.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#1e1e1e] text-[#606060]">
        <div className="text-center">
          <p className="text-lg mb-2">No files open</p>
          <p className="text-sm">Select a file from the explorer to view</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs
      value={activeFileId || undefined}
      onValueChange={setActiveFile}
      className="flex-1 flex flex-col"
    >
      <TabsList className="w-full justify-start rounded-none border-b border-[#333] bg-[#252525] h-10 p-0">
        {openFiles.map(file => (
          <TabsTrigger
            key={file.id}
            value={file.id}
            className="relative group rounded-none border-r border-[#333] px-4 py-2 data-[state=active]:bg-[#1e1e1e] data-[state=active]:text-[#e0e0e0] text-[#909090] h-10"
          >
            <span className="mr-2">{file.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeFile(file.id);
              }}
              className="opacity-0 group-hover:opacity-100 hover:bg-[#383838] rounded px-1"
            >
              ✕
            </button>
          </TabsTrigger>
        ))}
      </TabsList>

      {openFiles.map(file => (
        <TabsContent
          key={file.id}
          value={file.id}
          className="flex-1 m-0"
        >
          <CodeViewer
            content={file.content}
            fileName={file.name}
            filePath={file.path}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

**Step 2: 验证组件类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit FileTabs 组件**

```bash
git add src/components/FileTabs/
git commit -m "feat: implement FileTabs component with tab management"
```

---

## Phase 4: 主应用迁移

### Task 4.1: 创建 Sidebar 组件族

**Files:**
- Create: `src/components/Sidebar/Sidebar.tsx`
- Create: `src/components/Sidebar/SidebarHeader.tsx`
- Create: `src/components/Sidebar/RepositoryList.tsx`
- Create: `src/components/Sidebar/RepositoryItem.tsx`
- Create: `src/components/Sidebar/WorkspaceList.tsx`
- Create: `src/components/Sidebar/AddMenu.tsx`
- Create: `src/components/Sidebar/CloneDialog.tsx`

**Step 1: 创建 SidebarHeader**

`src/components/Sidebar/SidebarHeader.tsx`:
```typescript
import React from 'react';

export function SidebarHeader() {
  return (
    <div className="px-4 py-3 border-b border-[#333]">
      <h2 className="text-sm font-semibold text-[#e0e0e0]">WORKSPACES</h2>
    </div>
  );
}
```

**Step 2: 创建 CloneDialog**

`src/components/Sidebar/CloneDialog.tsx`:
```typescript
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/contexts/AppContext';

interface CloneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloneDialog({ open, onOpenChange }: CloneDialogProps) {
  const [url, setUrl] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  const { cloneRepository } = useApp();

  const handleClone = async () => {
    if (!url.trim()) return;

    try {
      setIsCloning(true);
      await cloneRepository(url);
      onOpenChange(false);
      setUrl('');
    } catch (error) {
      // Error already handled in context
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2a2a2a] border-[#444]">
        <DialogHeader>
          <DialogTitle className="text-[#e0e0e0]">Clone Git Repository</DialogTitle>
          <DialogDescription className="text-[#909090]">
            Enter the repository URL to clone
          </DialogDescription>
        </DialogHeader>

        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/user/repo.git"
          className="bg-[#1e1e1e] border-[#444] text-[#e0e0e0]"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleClone();
            }
          }}
        />

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-[#444] text-[#e0e0e0] hover:bg-[#383838]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleClone}
            disabled={!url.trim() || isCloning}
            className="bg-[#4a9eff] hover:bg-[#3a8eef] text-white"
          >
            {isCloning ? 'Cloning...' : 'Clone'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 3: 创建 AddMenu**

`src/components/Sidebar/AddMenu.tsx`:
```typescript
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CloneDialog } from './CloneDialog';
import { useApp } from '@/contexts/AppContext';

export function AddMenu() {
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const { openProject } = useApp();

  return (
    <>
      <div className="p-2 border-t border-[#333]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start border-[#444] text-[#e0e0e0] hover:bg-[#2a2a2a]"
            >
              <span className="mr-2">+</span> Add
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#2a2a2a] border-[#444]">
            <DropdownMenuItem
              onClick={() => setShowCloneDialog(true)}
              className="text-[#e0e0e0] focus:bg-[#383838] focus:text-[#e0e0e0]"
            >
              Clone from URL
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={openProject}
              className="text-[#e0e0e0] focus:bg-[#383838] focus:text-[#e0e0e0]"
            >
              Open Local Project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CloneDialog open={showCloneDialog} onOpenChange={setShowCloneDialog} />
    </>
  );
}
```

**Step 4: 创建 WorkspaceList**

`src/components/Sidebar/WorkspaceList.tsx`:
```typescript
import React from 'react';
import type { Workspace } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { formatDate } from '@/lib/utils';

interface WorkspaceListProps {
  workspaces: Workspace[];
  repoId: string;
}

export function WorkspaceList({ workspaces, repoId }: WorkspaceListProps) {
  const { selectedWorkspace, selectWorkspace, createWorkspace, deleteWorkspace } = useApp();

  const handleCreateWorkspace = () => {
    createWorkspace(repoId);
  };

  return (
    <div className="ml-4">
      <button
        onClick={handleCreateWorkspace}
        className="w-full text-left px-3 py-1.5 text-sm hover:bg-[#2a2a2a] text-[#4a9eff] flex items-center gap-2"
      >
        <span>+</span> New Workspace
      </button>

      {workspaces.map((workspace) => {
        const isSelected = selectedWorkspace === workspace.id;
        const stats = [];
        if (workspace.git_insertions) stats.push(`+${workspace.git_insertions}`);
        if (workspace.git_deletions) stats.push(`-${workspace.git_deletions}`);

        return (
          <div
            key={workspace.id}
            className={`px-3 py-1.5 text-sm cursor-pointer group flex items-center justify-between ${
              isSelected ? 'bg-[#2a2a2a] text-[#e0e0e0]' : 'text-[#909090] hover:bg-[#2a2a2a] hover:text-[#e0e0e0]'
            }`}
            onClick={() => selectWorkspace(workspace.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium">{workspace.directory_name || workspace.branch}</div>
              <div className="text-xs flex items-center gap-2 mt-0.5">
                {workspace.branch && (
                  <span className="text-[#4a9eff]">{workspace.branch}</span>
                )}
                {stats.length > 0 && (
                  <span className="text-[#606060]">{stats.join(' ')}</span>
                )}
              </div>
              {workspace.updated_at && (
                <div className="text-xs text-[#606060] mt-0.5">
                  {formatDate(workspace.updated_at)}
                </div>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteWorkspace(workspace.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-[#606060] hover:text-[#f87171] px-1"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

**Step 5: 创建 RepositoryItem**

`src/components/Sidebar/RepositoryItem.tsx`:
```typescript
import React, { useState } from 'react';
import type { RepoWithWorkspaces } from '@/types';
import { WorkspaceList } from './WorkspaceList';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/contexts/AppContext';

interface RepositoryItemProps {
  repo: RepoWithWorkspaces;
}

export function RepositoryItem({ repo }: RepositoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const { deleteRepository } = useApp();

  return (
    <div className="border-b border-[#333]">
      <div
        className="px-4 py-2 hover:bg-[#2a2a2a] cursor-pointer flex items-center justify-between group"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div
          className="flex items-center gap-2 flex-1"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className="text-[#909090]">{isExpanded ? '▾' : '▸'}</span>
          <span className="text-sm font-medium text-[#e0e0e0]">
            {repo.name || 'Unnamed Repository'}
          </span>
        </div>

        {showMenu && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="text-[#909090] hover:text-[#e0e0e0] px-2">
                ⋮
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-[#2a2a2a] border-[#444]">
              <DropdownMenuItem
                onClick={() => deleteRepository(repo.id)}
                className="text-[#f87171] focus:bg-[#383838] focus:text-[#f87171]"
              >
                Delete Repository
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isExpanded && (
        <WorkspaceList workspaces={repo.workspaces} repoId={repo.id} />
      )}
    </div>
  );
}
```

**Step 6: 创建 RepositoryList**

`src/components/Sidebar/RepositoryList.tsx`:
```typescript
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RepositoryItem } from './RepositoryItem';
import { useApp } from '@/contexts/AppContext';

export function RepositoryList() {
  const { repositories, isLoading } = useApp();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#606060] text-sm">
        Loading repositories...
      </div>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#606060] text-sm text-center p-4">
        <div>
          <p>No repositories yet</p>
          <p className="text-xs mt-1">Use the Add button below to get started</p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      {repositories.map((repo) => (
        <RepositoryItem key={repo.id} repo={repo} />
      ))}
    </ScrollArea>
  );
}
```

**Step 7: 创建 Sidebar 主组件**

`src/components/Sidebar/Sidebar.tsx`:
```typescript
import React from 'react';
import { SidebarHeader } from './SidebarHeader';
import { RepositoryList } from './RepositoryList';
import { AddMenu } from './AddMenu';

export function Sidebar() {
  return (
    <div className="w-72 bg-[#252525] border-r border-[#333] flex flex-col">
      <SidebarHeader />
      <RepositoryList />
      <AddMenu />
    </div>
  );
}
```

**Step 8: 验证组件类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 9: Commit Sidebar 组件族**

```bash
git add src/components/Sidebar/
git commit -m "feat: implement Sidebar component family"
```

---

### Task 4.2: 创建 MainContent 和 FileExplorer 布局组件

**Files:**
- Create: `src/components/MainContent.tsx`
- Create: `src/components/FileExplorer.tsx`

**Step 1: 创建 FileExplorer**

`src/components/FileExplorer.tsx`:
```typescript
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileTree } from '@/components/FileTree/FileTree';
import { useApp } from '@/contexts/AppContext';

export function FileExplorer() {
  const { files, selectedWorkspace, openFile } = useApp();

  return (
    <div className="w-64 bg-[#1e1e1e] border-l border-[#333] flex flex-col">
      <div className="px-4 py-3 border-b border-[#333]">
        <h3 className="text-sm font-semibold text-[#e0e0e0]">EXPLORER</h3>
      </div>

      <ScrollArea className="flex-1">
        {!selectedWorkspace ? (
          <div className="p-4 text-sm text-[#606060] text-center">
            Select a workspace to view files
          </div>
        ) : (
          <FileTree items={files} onFileClick={openFile} />
        )}
      </ScrollArea>
    </div>
  );
}
```

**Step 2: 创建 MainContent**

`src/components/MainContent.tsx`:
```typescript
import React from 'react';
import { FileTabs } from '@/components/FileTabs/FileTabs';
import { Terminal } from '@/components/Terminal/Terminal';

export function MainContent() {
  return (
    <div className="flex-1 flex flex-col">
      <FileTabs />
      <Terminal />
    </div>
  );
}
```

**Step 3: 验证组件类型**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 4: Commit 布局组件**

```bash
git add src/components/MainContent.tsx src/components/FileExplorer.tsx
git commit -m "feat: implement MainContent and FileExplorer layout components"
```

---

### Task 4.3: 创建 App.tsx 主应用组件

**Files:**
- Create: `src/App.tsx`

**Step 1: 创建 App.tsx**

`src/App.tsx`:
```typescript
import React from 'react';
import { AppProvider } from '@/contexts/AppContext';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { MainContent } from '@/components/MainContent';
import { FileExplorer } from '@/components/FileExplorer';

function App() {
  return (
    <AppProvider>
      <div className="flex h-screen bg-[#1a1a1a] text-[#e0e0e0] overflow-hidden">
        <Sidebar />
        <MainContent />
        <FileExplorer />
      </div>
    </AppProvider>
  );
}

export default App;
```

**Step 2: 验证 App 组件**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit App 组件**

```bash
git add src/App.tsx
git commit -m "feat: implement main App component"
```

---

### Task 4.4: 创建 main.tsx 入口文件

**Files:**
- Create: `src/main.tsx`

**Step 1: 创建 main.tsx**

`src/main.tsx`:
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

**Step 2: 验证入口文件**

Run: `npx tsc --noEmit`
Expected: 无错误

**Step 3: Commit 入口文件**

```bash
git add src/main.tsx
git commit -m "feat: create React app entry point"
```

---

### Task 4.5: 更新 index.html

**Files:**
- Modify: `index.html`

**Step 1: 更新 index.html 脚本引用**

确认 `index.html` 中的脚本引用正确：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Brasilia</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 2: 验证 HTML 文件**

Run: `cat index.html`
Expected: 显示正确的脚本引用

**Step 3: Commit HTML 更新**

```bash
git add index.html
git commit -m "fix: update index.html to reference React entry point"
```

---

## Phase 5: 测试和优化

### Task 5.1: 启动开发服务器测试

**Step 1: 启动 Tauri 开发模式**

```bash
npm run tauri dev
```

**Step 2: 验证应用启动**

Expected:
- Tauri 窗口打开
- 无 TypeScript 编译错误
- 无浏览器控制台错误
- 界面正常显示

**Step 3: 测试基础功能**

手动测试：
1. 点击 "Add" 按钮
2. 选择 "Open Local Project"
3. 验证仓库列表加载
4. 创建新工作区
5. 选择工作区
6. 验证文件树显示
7. 点击文件
8. 验证语法高亮显示
9. 测试多个文件标签页
10. 测试关闭文件标签
11. 验证终端输出

**Step 4: 记录问题**

如果发现问题，记录到 `docs/migration-issues.md`

---

### Task 5.2: 修复样式问题

**Step 1: 检查深色主题一致性**

对比原 Vue 应用和新 React 应用的：
- 背景色
- 文字颜色
- 边框颜色
- 悬停效果

**Step 2: 调整不一致的样式**

根据需要更新组件的 Tailwind 类名

**Step 3: Commit 样式修复**

```bash
git add src/
git commit -m "style: fix dark theme consistency"
```

---

### Task 5.3: 性能优化

**Step 1: 添加 React.memo 优化**

对频繁渲染的组件添加 `React.memo`：
- `FileTreeItem`
- `RepositoryItem`

**Step 2: 优化大型文件树渲染**

如果文件树很大，考虑虚拟滚动

**Step 3: Commit 性能优化**

```bash
git add src/
git commit -m "perf: optimize component re-renders with React.memo"
```

---

### Task 5.4: 清理备份文件

**Step 1: 删除 Vue 备份文件**

```bash
rm src/*.backup src/components/*.backup
```

**Step 2: 删除 assets/vue.svg**

```bash
rm src/assets/vue.svg
```

**Step 3: Commit 清理**

```bash
git add -A
git commit -m "cleanup: remove Vue backup files and assets"
```

---

### Task 5.5: 更新文档

**Files:**
- Modify: `README.md`

**Step 1: 更新 README 技术栈说明**

将 Vue 3 改为 React 18

**Step 2: 更新开发命令说明**

确认所有命令仍然正确

**Step 3: Commit 文档更新**

```bash
git add README.md
git commit -m "docs: update README to reflect React migration"
```

---

### Task 5.6: 创建最终测试报告

**Files:**
- Create: `docs/migration-complete.md`

**Step 1: 创建测试报告**

`docs/migration-complete.md`:
```markdown
# Vue to React 迁移完成报告

**日期**: 2026-01-09

## 迁移概述

成功将整个 Vue 3 前端迁移到 React 18。

## 技术栈变更

- ✅ Vue 3 → React 18
- ✅ prismjs → react-syntax-highlighter
- ✅ 新增 shadcn/ui
- ✅ 保留 Tailwind CSS
- ✅ 保留 Tauri v2 后端

## 功能验证

- [ ] 仓库列表加载
- [ ] 工作区创建
- [ ] 文件树导航
- [ ] 文件查看和语法高亮
- [ ] 多标签页管理
- [ ] 克隆仓库
- [ ] 打开本地项目
- [ ] 删除仓库/工作区
- [ ] 终端输出
- [ ] Git 统计显示

## 已知问题

（记录任何已知问题）

## 性能对比

（记录性能数据）

## 下一步

- 进行更全面的测试
- 收集用户反馈
- 考虑添加单元测试
```

**Step 2: Commit 测试报告**

```bash
git add docs/migration-complete.md
git commit -m "docs: add migration completion report"
```

---

## 执行完成

所有迁移任务已完成！最终验证：

```bash
# 运行类型检查
npx tsc --noEmit

# 启动开发服务器
npm run tauri dev

# 构建生产版本
npm run tauri build
```

**预期结果**：
- ✅ 无 TypeScript 错误
- ✅ 应用正常启动
- ✅ 所有功能正常工作
- ✅ UI 风格与原 Vue 应用一致
- ✅ 构建成功
