<script setup>
import { OTHER_REPOS } from '../../config';
</script>

<template>
  <section class="other-repositories" aria-labelledby="other-repositories-title">
    <div class="section-heading" v-reveal>
      <span class="section-index" style="background: var(--clay-blue)">03</span>
      <div class="section-heading-copy">
        <h2 id="other-repositories-title">其他代码仓库</h2>
        <p>Agent 是现在的主线，这些仓库保留了移动端、Web 与工具项目的实践轨迹。</p>
      </div>
    </div>
    <ul class="other-repository-grid">
      <li v-for="([name, lang, stars], index) in OTHER_REPOS" :key="name" v-reveal="index * 45">
        <a :href="`https://github.com/TheSyart/${name}`" target="_blank" rel="noopener" class="clay-surface clay-interactive">
          <span class="font-code">{{ name }}</span><small>{{ lang }}</small><b>★ {{ stars }}</b>
        </a>
      </li>
    </ul>
  </section>
</template>
