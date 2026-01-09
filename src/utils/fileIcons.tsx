import { ReactNode } from 'react';
import {
  VscFolder,
  VscFolderOpened,
  VscFile,
  VscJson,
  VscFileCode,
} from 'react-icons/vsc';
import {
  SiJavascript,
  SiTypescript,
  SiHtml5,
  SiCss3,
  SiReact,
  SiNodedotjs,
  SiGit,
  SiMarkdown,
  SiPython,
  SiRust,
  SiGo,
  SiDocker,
} from 'react-icons/si';
import { DiNpm } from 'react-icons/di';
import { AiOutlineFileImage } from 'react-icons/ai';

/**
 * 根据文件名获取对应的图标
 */
export function getFileIcon(fileName: string, isFolder: boolean, isExpanded?: boolean): ReactNode {
  if (isFolder) {
    return isExpanded ? (
      <VscFolderOpened className="w-4 h-4 text-[#dcb67a]" />
    ) : (
      <VscFolder className="w-4 h-4 text-[#dcb67a]" />
    );
  }

  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  const fileNameLower = fileName.toLowerCase();

  // 特殊文件名匹配
  const specialFiles: Record<string, ReactNode> = {
    'package.json': <SiNodedotjs className="w-4 h-4 text-[#8CC84B]" />,
    'package-lock.json': <DiNpm className="w-4 h-4 text-[#CB3837]" />,
    'tsconfig.json': <SiTypescript className="w-4 h-4 text-[#3178C6]" />,
    'vite.config.ts': <VscFileCode className="w-4 h-4 text-[#646CFF]" />,
    'vite.config.js': <VscFileCode className="w-4 h-4 text-[#646CFF]" />,
    '.gitignore': <SiGit className="w-4 h-4 text-[#F05032]" />,
    '.gitattributes': <SiGit className="w-4 h-4 text-[#F05032]" />,
    'readme.md': <SiMarkdown className="w-4 h-4 text-[#ffffff]" />,
    'dockerfile': <SiDocker className="w-4 h-4 text-[#2496ED]" />,
    '.dockerignore': <SiDocker className="w-4 h-4 text-[#2496ED]" />,
    '.env': <VscFileCode className="w-4 h-4 text-[#ECD53F]" />,
    '.env.local': <VscFileCode className="w-4 h-4 text-[#ECD53F]" />,
    '.env.development': <VscFileCode className="w-4 h-4 text-[#ECD53F]" />,
    '.env.production': <VscFileCode className="w-4 h-4 text-[#ECD53F]" />,
  };

  if (specialFiles[fileNameLower]) {
    return specialFiles[fileNameLower];
  }

  // 根据文件扩展名返回图标
  const extensionIcons: Record<string, ReactNode> = {
    // JavaScript/TypeScript
    js: <SiJavascript className="w-4 h-4 text-[#F7DF1E]" />,
    jsx: <SiReact className="w-4 h-4 text-[#61DAFB]" />,
    ts: <SiTypescript className="w-4 h-4 text-[#3178C6]" />,
    tsx: <SiReact className="w-4 h-4 text-[#61DAFB]" />,
    mjs: <SiJavascript className="w-4 h-4 text-[#F7DF1E]" />,
    cjs: <SiJavascript className="w-4 h-4 text-[#F7DF1E]" />,

    // JSON
    json: <VscJson className="w-4 h-4 text-[#d4b830]" />,
    jsonc: <VscJson className="w-4 h-4 text-[#d4b830]" />,

    // HTML/CSS
    html: <SiHtml5 className="w-4 h-4 text-[#E34F26]" />,
    htm: <SiHtml5 className="w-4 h-4 text-[#E34F26]" />,
    css: <SiCss3 className="w-4 h-4 text-[#1572B6]" />,
    scss: <SiCss3 className="w-4 h-4 text-[#CC6699]" />,
    sass: <SiCss3 className="w-4 h-4 text-[#CC6699]" />,
    less: <SiCss3 className="w-4 h-4 text-[#1D365D]" />,

    // Images
    png: <AiOutlineFileImage className="w-4 h-4 text-[#c084fc]" />,
    jpg: <AiOutlineFileImage className="w-4 h-4 text-[#c084fc]" />,
    jpeg: <AiOutlineFileImage className="w-4 h-4 text-[#c084fc]" />,
    gif: <AiOutlineFileImage className="w-4 h-4 text-[#c084fc]" />,
    svg: <AiOutlineFileImage className="w-4 h-4 text-[#FFB13B]" />,
    ico: <AiOutlineFileImage className="w-4 h-4 text-[#c084fc]" />,
    webp: <AiOutlineFileImage className="w-4 h-4 text-[#c084fc]" />,

    // Markdown
    md: <SiMarkdown className="w-4 h-4 text-[#ffffff]" />,
    mdx: <SiMarkdown className="w-4 h-4 text-[#ffffff]" />,

    // Config files
    yml: <VscFileCode className="w-4 h-4 text-[#9ca3af]" />,
    yaml: <VscFileCode className="w-4 h-4 text-[#9ca3af]" />,
    toml: <VscFileCode className="w-4 h-4 text-[#9ca3af]" />,
    xml: <VscFileCode className="w-4 h-4 text-[#9ca3af]" />,
    ini: <VscFileCode className="w-4 h-4 text-[#9ca3af]" />,

    // Python
    py: <SiPython className="w-4 h-4 text-[#3776AB]" />,
    pyc: <SiPython className="w-4 h-4 text-[#3776AB]" />,
    pyd: <SiPython className="w-4 h-4 text-[#3776AB]" />,
    pyw: <SiPython className="w-4 h-4 text-[#3776AB]" />,

    // Rust
    rs: <SiRust className="w-4 h-4 text-[#CE422B]" />,

    // Go
    go: <SiGo className="w-4 h-4 text-[#00ADD8]" />,

    // Shell
    sh: <VscFileCode className="w-4 h-4 text-[#89e051]" />,
    bash: <VscFileCode className="w-4 h-4 text-[#89e051]" />,
    zsh: <VscFileCode className="w-4 h-4 text-[#89e051]" />,

    // Database
    sql: <VscFileCode className="w-4 h-4 text-[#e38c00]" />,
    db: <VscFileCode className="w-4 h-4 text-[#e38c00]" />,
    sqlite: <VscFileCode className="w-4 h-4 text-[#e38c00]" />,

    // Lock files
    lock: <VscFile className="w-4 h-4 text-[#606060]" />,

    // Text files
    txt: <VscFile className="w-4 h-4 text-[#909090]" />,
    log: <VscFile className="w-4 h-4 text-[#909090]" />,
  };

  if (extensionIcons[extension]) {
    return extensionIcons[extension];
  }

  // 默认文件图标
  return <VscFile className="w-4 h-4 text-[#909090]" />;
}
