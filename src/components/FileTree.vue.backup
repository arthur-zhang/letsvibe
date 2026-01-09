<script setup lang="ts">
import { ref, watch } from 'vue';

interface FileItem {
  name: string;
  type: 'file' | 'folder';
  children?: FileItem[];
}

const props = withDefaults(defineProps<{
  items: FileItem[];
  level?: number;
  parentPath?: string;
}>(), {
  level: 0,
  parentPath: ''
});

const emit = defineEmits<{
  fileClick: [path: string, name: string]
}>();

const expandedFolders = ref<Set<string>>(new Set());

watch(() => props.items, () => {
  expandedFolders.value.clear();
}, { deep: true });

const toggleFolder = (name: string) => {
  if (expandedFolders.value.has(name)) {
    expandedFolders.value.delete(name);
  } else {
    expandedFolders.value.add(name);
  }
};

const handleClick = (item: FileItem) => {
  if (item.type === 'folder') {
    toggleFolder(item.name);
  } else {
    // Build the full path
    const fullPath = props.parentPath
      ? `${props.parentPath}/${item.name}`
      : item.name;
    emit('fileClick', fullPath, item.name);
  }
};

const getChildPath = (itemName: string) => {
  return props.parentPath
    ? `${props.parentPath}/${itemName}`
    : itemName;
};
</script>

<template>
  <div>
    <div v-if="items && items.length > 0">
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
          @click="handleClick(item)"
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
          :parent-path="getChildPath(item.name)"
          @file-click="(path, name) => $emit('fileClick', path, name)"
        />
      </div>
    </div>
    <div v-else class="px-4 py-8 text-center">
      <svg class="w-12 h-12 mx-auto mb-3 text-[#404040]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
      </svg>
      <p class="text-sm text-[#606060] mb-1">No files to display</p>
      <p class="text-xs text-[#404040]">Select a workspace to view files</p>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar styling for FileTree - vertical visible, horizontal hidden */
:deep(*) {
  overflow-x: hidden !important; /* Hide horizontal scrollbar */
  scrollbar-width: thin; /* Firefox - thin scrollbar */
  scrollbar-color: #3a3a3a #252525; /* Firefox - thumb and track colors */
}

/* Webkit browsers (Chrome, Safari, Edge) */
:deep(*::-webkit-scrollbar) {
  width: 12px; /* Vertical scrollbar width */
  height: 0; /* Hide horizontal scrollbar */
}

:deep(*::-webkit-scrollbar-track) {
  background: #252525; /* Track color - matches background */
}

:deep(*::-webkit-scrollbar-thumb) {
  background: #3a3a3a; /* Thumb color - medium gray */
  border-radius: 6px;
  border: 2px solid #252525; /* Border to create padding effect */
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  background: #4a4a4a; /* Lighter gray on hover */
}
</style>
