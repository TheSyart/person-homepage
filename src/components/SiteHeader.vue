<script setup>
import SealLogo from './SealLogo.vue';

const LINKS = [
  { to: '/', label: '首页', exact: true },
  { to: '/articles', label: '文章' },
  { to: '/videos', label: '视频' },
  { to: '/messages', label: '留言' }
];
</script>

<template>
  <header class="sticky top-0 z-50 bg-paper/90 backdrop-blur border-b hairline">
    <div class="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
      <router-link to="/" class="flex items-center gap-3 group">
        <SealLogo />
        <span class="font-serifSc font-bold text-xl tracking-wide group-hover:text-vermilion transition-colors">小单说AI</span>
      </router-link>

      <nav class="flex items-center gap-1 sm:gap-2">
        <router-link v-for="l in LINKS" :key="l.to" :to="l.to"
          class="px-3 py-2 text-[15px] transition-colors relative"
          :class="(l.exact ? $route.path === l.to : $route.path.startsWith(l.to))
            ? 'text-vermilion font-semibold'
            : 'text-muted hover:text-ink'">
          {{ l.label }}
          <span v-if="(l.exact ? $route.path === l.to : $route.path.startsWith(l.to))"
            class="absolute left-3 right-3 -bottom-[1px] h-[2px] bg-vermilion"></span>
        </router-link>
        <a href="https://github.com/TheSyart" target="_blank" rel="noopener"
          class="ml-2 hidden sm:inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink border hairline rounded-full px-3.5 py-1.5 transition-colors bg-card">
          <img src="/example/平台logo/github.png" alt="GitHub" class="w-4 h-4 rounded-sm">GitHub
        </a>
      </nav>
    </div>
  </header>
</template>
