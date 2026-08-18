<script setup>
import { MORE_PLATFORMS } from '../../config';
</script>

<template>
  <section class="py-16 border-b hairline">
    <h2 class="font-serifSc text-3xl font-bold mb-8" v-reveal>更多平台</h2>
    <div class="flex flex-wrap gap-x-12 gap-y-6" v-reveal="60">
      <a v-for="p in MORE_PLATFORMS" :key="p.name" :href="p.url" target="_blank" rel="noopener"
        class="flex items-center gap-3 group">
        <img :src="p.icon" :alt="p.name" class="w-9 h-9 transition-transform group-hover:scale-110">
        <span class="font-medium group-hover:text-vermilion transition-colors">{{ p.name }}</span>
      </a>
    </div>
  </section>
</template>
