import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';
import type { RepoWithWorkspaces, Workspace, FileItem, OpenFile } from '@/types';

interface AppContextType {
  // 数据状态
  repositories: RepoWithWorkspaces[];
  currentFile: OpenFile | null;
  files: FileItem[];
  terminalOutput: string[];

  // UI 状态
  selectedWorkspace: string | null;
  activeTab: 'file' | 'chat';
  showTerminal: boolean;
  isLoading: boolean;
  sidebarWidth: number;
  explorerWidth: number;

  // 操作方法
  loadRepositories: () => Promise<void>;
  selectWorkspace: (id: string) => Promise<void>;
  openFile: (path: string, name: string) => Promise<void>;
  closeCurrentFile: () => void;
  setActiveTab: (tab: 'file' | 'chat') => void;
  createWorkspace: (repoId: string) => Promise<void>;
  cloneRepository: (url: string) => Promise<void>;
  openProject: () => Promise<void>;
  deleteRepository: (id: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  addTerminalOutput: (message: string, type?: 'success' | 'error' | 'info') => void;
  toggleTerminal: () => void;
  setSidebarWidth: React.Dispatch<React.SetStateAction<number>>;
  setExplorerWidth: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [repositories, setRepositories] = useState<RepoWithWorkspaces[]>([]);
  const [currentFile, setCurrentFile] = useState<OpenFile | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    '✓ Application initialized',
    '✓ Database connection established',
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'file' | 'chat'>('chat');
  const [showTerminal, setShowTerminal] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(288); // w-72 = 18rem = 288px
  const [explorerWidth, setExplorerWidth] = useState(256); // w-64 = 16rem = 256px

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
      setCurrentFile(null);

      const workspaceFiles = await invoke<FileItem[]>('get_workspace_files', { workspaceId: id });
      setFiles(workspaceFiles);
      addTerminalOutput(`Workspace ${id} selected`, 'success');
    } catch (error) {
      addTerminalOutput(`Failed to load workspace files: ${error}`, 'error');
      console.error('Failed to load workspace files:', error);
    }
  }, [addTerminalOutput]);

  const openFile = useCallback(async (path: string, name: string) => {
    try {
      console.log('Opening file with params:', {
        workspaceId: selectedWorkspace,
        filePath: path,
        fileName: name
      });
      const content = await invoke<string>('read_file_content', {
        workspaceId: selectedWorkspace,
        filePath: path,
      });

      const newFile: OpenFile = {
        id: `${Date.now()}-${path}`,
        name: name,
        path: path,
        content,
      };

      setCurrentFile(newFile);
      setActiveTab('file');
      addTerminalOutput(`Opened file: ${name}`, 'success');
    } catch (error) {
      addTerminalOutput(`Failed to open file: ${error}`, 'error');
      console.error('Failed to open file:', error);
    }
  }, [selectedWorkspace, addTerminalOutput]);

  const handleSetActiveTab = useCallback((tab: 'file' | 'chat') => {
    setActiveTab(tab);
  }, []);

  const closeCurrentFile = useCallback(() => {
    setCurrentFile(null);
    setActiveTab('chat');
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
        setCurrentFile(null);
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
    currentFile,
    files,
    terminalOutput,
    selectedWorkspace,
    activeTab,
    showTerminal,
    isLoading,
    loadRepositories,
    selectWorkspace,
    openFile,
    closeCurrentFile,
    setActiveTab: handleSetActiveTab,
    createWorkspace,
    cloneRepository,
    openProject,
    deleteRepository,
    deleteWorkspace,
    addTerminalOutput,
    toggleTerminal,
    sidebarWidth,
    explorerWidth,
    setSidebarWidth,
    setExplorerWidth,
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
