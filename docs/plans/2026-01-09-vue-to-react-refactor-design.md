# Vue to React 重构设计文档

**日期**: 2026-01-09
**项目**: Brasilia (Git Worktree 管理工具)
**目标**: 将整个 Vue 3 前端完全重构为 React 18

---

## 1. 整体架构和技术栈

### 技术栈确认

**前端框架和工具**
- **React 18** + TypeScript
- **Vite** 作为构建工具（保持不变）
- **Tailwind CSS** 用于样式
- **shadcn/ui** 提供 UI 组件
- **react-syntax-highlighter** 用于代码高亮

**保持不变的部分**
- Tauri v2 后端（Rust）
- SQLite 数据库
- PostCSS + Tailwind 配置
- 深色主题色彩系统

### 项目结构设计

```
src/
├── components/           # UI 组件
│   ├── ui/              # shadcn/ui 组件
│   ├── FileTree/
│   │   ├── FileTree.tsx
│   │   ├── FileTreeItem.tsx
│   │   └── types.ts
│   ├── CodeViewer/
│   │   ├── CodeViewer.tsx
│   │   └── types.ts
│   ├── Sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── RepositoryList.tsx
│   │   ├── WorkspaceList.tsx
│   │   └── AddMenu.tsx
│   ├── Terminal/
│   │   └── Terminal.tsx
│   └── FileTabs/
│       └── FileTabs.tsx
├── hooks/               # 自定义 Hooks
│   ├── useRepositories.ts
│   ├── useWorkspaces.ts
│   ├── useFileSystem.ts
│   └── useTauriCommand.ts
├── contexts/            # React Context
│   └── AppContext.tsx
├── types/               # TypeScript 类型定义
│   ├── repository.ts
│   ├── workspace.ts
│   └── file.ts
├── lib/                 # 工具函数
│   └── utils.ts
├── App.tsx              # 主应用组件
├── main.tsx             # 应用入口
└── index.css            # 全局样式
```

### 核心设计原则

1. **组件拆分**：将当前的大型 App.vue (782行) 拆分为多个小型、专注的组件
2. **自定义 Hooks**：将数据获取和状态管理逻辑提取到可复用的 Hooks
3. **类型安全**：完整的 TypeScript 类型定义
4. **保持简洁**：使用 React Context 进行状态管理，不引入额外的状态管理库

---

## 2. 状态管理和数据流

### Context 设计

创建一个全局的 `AppContext` 来管理应用状态：

```typescript
// contexts/AppContext.tsx
interface AppContextType {
  // 数据状态
  repositories: RepoWithWorkspaces[];
  openFiles: OpenFile[];
  activeFileId: string | null;
  files: FileItem[];
  terminalOutput: string[];

  // UI 状态
  selectedWorkspace: string;
  showTerminal: boolean;
  isLoading: boolean;

  // 操作方法
  loadRepositories: () => Promise<void>;
  selectWorkspace: (id: string) => Promise<void>;
  openFile: (file: FileItem) => Promise<void>;
  closeFile: (id: string) => void;
  createWorkspace: (repoId: string) => Promise<void>;
  cloneRepository: (url: string) => Promise<void>;
  addTerminalOutput: (message: string, type: 'success' | 'error') => void;
}
```

### 自定义 Hooks 设计

**1. useTauriCommand** - 封装 Tauri 命令调用
```typescript
function useTauriCommand<T>(
  command: string,
  options?: { onSuccess?, onError? }
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (...args: any[]) => {
    // 调用 Tauri 命令并处理结果
  };

  return { data, loading, error, execute };
}
```

**2. useRepositories** - 管理仓库数据
```typescript
function useRepositories() {
  const [repositories, setRepositories] = useState<RepoWithWorkspaces[]>([]);
  const { execute: getRepos } = useTauriCommand('get_repositories');
  const { execute: createRepo } = useTauriCommand('create_repo');
  const { execute: deleteRepo } = useTauriCommand('delete_repo');

  const loadRepositories = async () => { /* ... */ };
  const addRepository = async (params) => { /* ... */ };
  const removeRepository = async (id) => { /* ... */ };

  return { repositories, loadRepositories, addRepository, removeRepository };
}
```

**3. useFileSystem** - 管理文件系统操作
```typescript
function useFileSystem(workspaceId: string | null) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);

  const loadFiles = async () => { /* ... */ };
  const openFile = async (file: FileItem) => { /* ... */ };
  const closeFile = (id: string) => { /* ... */ };

  return { files, openFiles, activeFileId, loadFiles, openFile, closeFile };
}
```

### 数据流设计

```
用户交互
  ↓
组件事件触发
  ↓
调用 Context 中的方法
  ↓
Hook 执行 Tauri 命令
  ↓
更新 Context 状态
  ↓
组件自动重新渲染
```

---

## 3. 核心组件设计

### 1. App.tsx - 主应用组件

**职责**：布局管理和顶层状态协调

```typescript
function App() {
  return (
    <AppProvider>
      <div className="flex h-screen bg-[#1a1a1a] text-[#e0e0e0]">
        <Sidebar />
        <MainContent />
        <FileExplorer />
      </div>
    </AppProvider>
  );
}
```

### 2. FileTree 组件

```typescript
interface FileTreeProps {
  items: FileItem[];
  onFileClick: (file: FileItem) => void;
  level?: number;
  parentPath?: string;
}

function FileTree({ items, onFileClick, level = 0, parentPath = '' }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className="text-sm">
      {items.map(item => (
        <FileTreeItem
          key={item.path}
          item={item}
          level={level}
          isExpanded={expandedFolders.has(item.path)}
          onToggle={() => toggleFolder(item.path)}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}
```

### 3. CodeViewer 组件

```typescript
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeViewerProps {
  content: string;
  language: string;
  fileName: string;
  filePath: string;
}

function CodeViewer({ content, language, fileName, filePath }: CodeViewerProps) {
  const detectedLanguage = detectLanguage(fileName);

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="px-4 py-2 border-b border-[#333]">
        <div className="text-sm text-[#909090]">{filePath}</div>
      </div>

      <div className="flex-1 overflow-auto">
        <SyntaxHighlighter
          language={detectedLanguage}
          style={vscDarkPlus}
          showLineNumbers
          customStyle={{
            margin: 0,
            background: '#1e1e1e',
            fontSize: '13px',
          }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
```

### 4. Sidebar 组件族

```typescript
// Sidebar.tsx - 主容器
function Sidebar() {
  return (
    <div className="w-72 bg-[#252525] border-r border-[#333]">
      <SidebarHeader />
      <RepositoryList />
      <AddMenu />
    </div>
  );
}

// RepositoryList.tsx - 仓库列表
function RepositoryList() {
  const { repositories } = useApp();

  return (
    <div className="overflow-y-auto">
      {repositories.map(repo => (
        <RepositoryItem key={repo.id} repo={repo} />
      ))}
    </div>
  );
}
```

---

## 4. shadcn/ui 集成和样式系统

### 使用的 shadcn/ui 组件

1. **Dialog** - 用于克隆仓库的模态框
2. **Button** - 统一的按钮样式
3. **ScrollArea** - 优化的滚动区域
4. **Tabs** - 文件标签页
5. **DropdownMenu** - 仓库操作菜单和添加菜单
6. **Tooltip** - 提示信息

### 配置调整

**tailwind.config.js**
```javascript
module.exports = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#1a1a1a",
        sidebar: "#252525",
        border: "#333",
        primary: "#4a9eff",
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

### 组件样式示例

**CloneRepositoryDialog**:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function CloneRepositoryDialog({ open, onOpenChange }: Props) {
  const [url, setUrl] = useState('');
  const { cloneRepository } = useApp();

  const handleClone = async () => {
    await cloneRepository(url);
    onOpenChange(false);
    setUrl('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#2a2a2a] border-[#444]">
        <DialogHeader>
          <DialogTitle className="text-[#e0e0e0]">
            Clone Git Repository
          </DialogTitle>
        </DialogHeader>

        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://github.com/user/repo.git"
          className="bg-[#1e1e1e] border-[#444] text-[#e0e0e0]"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleClone} className="bg-[#4a9eff]">
            Clone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 5. 迁移计划和工具配置

### 迁移步骤

**Phase 1: 项目基础搭建**
1. 安装 React 相关依赖
2. 配置 Vite 支持 React + TypeScript
3. 设置 shadcn/ui
4. 配置 Tailwind CSS（保留现有配置）
5. 创建基础项目结构（目录、类型定义）

**Phase 2: 核心基础设施**
1. 创建类型定义（`types/` 目录）
2. 实现 `useTauriCommand` Hook
3. 实现 `AppContext` 和 `AppProvider`
4. 实现核心 Hooks（`useRepositories`, `useFileSystem`）

**Phase 3: 组件迁移**
1. 迁移 `FileTree` 组件
2. 迁移 `CodeViewer` 组件（集成 react-syntax-highlighter）
3. 迁移 `Terminal` 组件
4. 创建 `FileTabs` 组件

**Phase 4: 主应用迁移**
1. 创建 `Sidebar` 组件族（RepositoryList, WorkspaceList, AddMenu）
2. 创建 `MainContent` 布局组件
3. 创建 `FileExplorer` 组件
4. 实现 `App.tsx` 主组件
5. 迁移克隆仓库、创建工作区等功能

**Phase 5: 测试和优化**
1. 功能测试（所有 Tauri 命令调用）
2. UI 测试（对比原 Vue 版本）
3. 性能优化（大文件、长列表）
4. 代码清理和文档

### 依赖包清单

**需要安装的包**：
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-syntax-highlighter": "^15.5.0",
    "@tauri-apps/api": "^2.0.0",
    "@tauri-apps/plugin-dialog": "^2.4.2",
    "@tauri-apps/plugin-opener": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-syntax-highlighter": "^15.5.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.6.2",
    "vite": "^6.0.3",
    "tailwindcss": "^3.4.19",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

**需要移除的包**：
```json
{
  "vue": "^3.5.13",
  "prismjs": "^1.30.0"
}
```

### Vite 配置更新

**vite.config.ts**：
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

**tsconfig.json** - 调整 React 支持：
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

### 迁移检查清单

- [ ] 所有 Tauri 命令调用正常工作
- [ ] 仓库列表加载和显示
- [ ] 工作区创建和选择
- [ ] 文件树展示和导航
- [ ] 文件打开和语法高亮
- [ ] 多标签页管理
- [ ] 克隆仓库功能
- [ ] 打开本地项目功能
- [ ] 终端输出显示
- [ ] Git 统计信息显示
- [ ] 所有 UI 交互（悬停、点击、展开/折叠）
- [ ] 深色主题样式一致性
- [ ] 滚动条样式保持
- [ ] 响应式布局

---

## 总结

这是一个完整的 **Vue 3 → React 18** 重构方案，核心特点：

✅ **技术栈现代化**: React 18 + TypeScript + Hooks
✅ **UI 增强**: shadcn/ui 提供更好的组件体验
✅ **代码组织**: 清晰的分层结构，易于维护
✅ **样式一致**: 保留现有深色主题和视觉风格
✅ **功能完整**: 一次性迁移所有功能
✅ **类型安全**: 完整的 TypeScript 类型系统

**预估工作量**：
- 基础搭建: ~50 行配置 + 依赖安装
- 核心基础设施: ~300 行（Context, Hooks, 类型）
- 组件迁移: ~800 行（所有组件）
- 测试优化: 功能验证和调整

**总计约 1200-1500 行代码**，对应当前 Vue 项目规模。
