<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import Prism from 'prismjs';

// Import commonly used language support
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-toml';
import 'prismjs/components/prism-sql';

const props = defineProps<{
  code: string;
  filename: string;
}>();

const highlightedCode = ref('');

const getLanguageFromFilename = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'json': 'json',
    'css': 'css',
    'scss': 'scss',
    'sass': 'scss',
    'md': 'markdown',
    'markdown': 'markdown',
    'sh': 'bash',
    'bash': 'bash',
    'py': 'python',
    'rs': 'rust',
    'yml': 'yaml',
    'yaml': 'yaml',
    'toml': 'toml',
    'sql': 'sql',
    'html': 'markup',
    'xml': 'markup',
    'vue': 'markup',
  };

  return languageMap[ext || ''] || 'plaintext';
};

const highlightCode = () => {
  const language = getLanguageFromFilename(props.filename);

  if (language === 'plaintext' || !Prism.languages[language]) {
    highlightedCode.value = props.code;
  } else {
    highlightedCode.value = Prism.highlight(
      props.code,
      Prism.languages[language],
      language
    );
  }
};

watch(() => [props.code, props.filename], () => {
  highlightCode();
}, { immediate: true });

onMounted(() => {
  highlightCode();
});
</script>

<template>
  <div class="flex-1 overflow-auto p-4 font-mono text-sm bg-[#1a1a1a]">
    <div class="flex">
      <!-- Line Numbers -->
      <div class="select-none text-right pr-4 text-[#606060] flex-shrink-0">
        <div
          v-for="(_line, index) in code.split('\n')"
          :key="index"
          class="leading-6"
        >
          {{ index + 1 }}
        </div>
      </div>
      <!-- Code Content with Syntax Highlighting -->
      <pre class="flex-1 leading-6"><code class="language-" v-html="highlightedCode"></code></pre>
    </div>
  </div>
</template>

<style scoped>
/* Prism.js dark theme colors */
:deep(.token.comment),
:deep(.token.prolog),
:deep(.token.doctype),
:deep(.token.cdata) {
  color: #6a9955;
}

:deep(.token.punctuation) {
  color: #d4d4d4;
}

:deep(.token.property),
:deep(.token.tag),
:deep(.token.boolean),
:deep(.token.number),
:deep(.token.constant),
:deep(.token.symbol),
:deep(.token.deleted) {
  color: #b5cea8;
}

:deep(.token.selector),
:deep(.token.attr-name),
:deep(.token.string),
:deep(.token.char),
:deep(.token.builtin),
:deep(.token.inserted) {
  color: #ce9178;
}

:deep(.token.operator),
:deep(.token.entity),
:deep(.token.url),
:deep(.language-css .token.string),
:deep(.style .token.string) {
  color: #d4d4d4;
}

:deep(.token.atrule),
:deep(.token.attr-value),
:deep(.token.keyword) {
  color: #c586c0;
}

:deep(.token.function),
:deep(.token.class-name) {
  color: #dcdcaa;
}

:deep(.token.regex),
:deep(.token.important),
:deep(.token.variable) {
  color: #d16969;
}

:deep(.token.important),
:deep(.token.bold) {
  font-weight: bold;
}

:deep(.token.italic) {
  font-style: italic;
}

:deep(.token.entity) {
  cursor: help;
}

/* Enable word wrapping for long lines */
pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

code {
  display: block;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* Custom scrollbar styling - vertical visible, horizontal hidden */
.flex-1.overflow-auto {
  overflow-x: hidden; /* Hide horizontal scrollbar */
  overflow-y: auto; /* Show vertical scrollbar */
  scrollbar-width: thin; /* Firefox - thin scrollbar */
  scrollbar-color: #3a3a3a #1a1a1a; /* Firefox - thumb and track colors */
}

/* Webkit browsers (Chrome, Safari, Edge) */
.flex-1.overflow-auto::-webkit-scrollbar {
  width: 12px; /* Vertical scrollbar width */
  height: 0; /* Hide horizontal scrollbar */
}

.flex-1.overflow-auto::-webkit-scrollbar-track {
  background: #1a1a1a; /* Track color - matches background */
}

.flex-1.overflow-auto::-webkit-scrollbar-thumb {
  background: #3a3a3a; /* Thumb color - medium gray */
  border-radius: 6px;
  border: 2px solid #1a1a1a; /* Border to create padding effect */
}

.flex-1.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #4a4a4a; /* Lighter gray on hover */
}
</style>
