<script setup>
/* 轻量描边图标集（24x24 stroke），避免依赖图标库 CDN */
const props = defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 18 }
});
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'star'">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'fork'">
      <circle cx="6" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="8" r="2.5" />
      <path d="M6 8.5v7" /><path d="M18 10.5c0 4-4.5 4-9.6 4.6" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <line x1="4" y1="12" x2="20" y2="12" /><polyline points="13 5 20 12 13 19" />
    </template>
    <template v-else-if="name === 'chevron-down'">
      <polyline points="6 9 12 15 18 9" />
    </template>
    <template v-else-if="name === 'external'">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
    </template>
    <template v-else-if="name === 'folder'">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </template>
    <template v-else-if="name === 'users'">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </template>
    <template v-else-if="name === 'mail'">
      <rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="22,6 12,13 2,6" />
    </template>
    <template v-else-if="name === 'play'">
      <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" stroke="none" />
    </template>
    <template v-else-if="name === 'music'">
      <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
    </template>
    <template v-else-if="name === 'robot'">
      <rect x="4" y="8" width="16" height="12" rx="2" /><path d="M12 8V4" /><circle cx="12" cy="3" r="1" />
      <circle cx="9" cy="13" r="1" fill="currentColor" /><circle cx="15" cy="13" r="1" fill="currentColor" />
      <path d="M9 17h6" />
    </template>
    <template v-else-if="name === 'crown'">
      <path d="M3 18h18" /><path d="M4 18l-1.2-8L8 13l4-7 4 7 5.2-3L20 18z" />
    </template>
    <template v-else>
      <circle cx="12" cy="12" r="9" />
    </template>
  </svg>
</template>
