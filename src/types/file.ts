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
