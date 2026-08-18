<script setup>
import { MORE_PLATFORMS } from '../../config';

const TONES = ['clay-surface--blue', 'clay-surface--pink', 'clay-surface--green', 'clay-surface--yellow'];
</script>

<template>
  <section class="platform-section" aria-labelledby="platform-heading">
    <div class="section-heading" v-reveal>
      <span class="section-index" style="background: var(--clay-yellow)">05</span>
      <div class="section-heading-copy">
        <h2 id="platform-heading">更多平台</h2>
        <p>在不同平台，继续分享同一件事。</p>
      </div>
      <span class="section-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>

    <div class="platform-grid">
      <a v-for="(platform, index) in MORE_PLATFORMS" :key="platform.name" :href="platform.url"
        target="_blank" rel="noopener" class="platform-card clay-surface clay-interactive" :class="TONES[index]" v-reveal="index * 50">
        <img :src="platform.icon" :alt="platform.name">
        <strong>{{ platform.name }}</strong>
      </a>
    </div>
  </section>
</template>
