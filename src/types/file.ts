export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
}

export interface OpenFile {
  id: string;
  name: string;
  path: string;
  content: string;
}
