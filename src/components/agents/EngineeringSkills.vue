<script setup>
import { SKILLS } from '../../config';

const GROUPS = [
  ['后端', SKILLS.slice(0, 3)],
  ['前端', SKILLS.slice(3, 10)],
  ['语言与移动端', SKILLS.slice(10, 14)],
  ['数据与基础设施', SKILLS.slice(14, 19)],
  ['创作工具', SKILLS.slice(19)]
];
</script>

<template>
  <section class="engineering-section" aria-labelledby="engineering-title">
    <div class="section-heading" v-reveal>
      <span class="section-index" style="background: var(--clay-yellow)">03</span>
      <div class="section-heading-copy">
        <h2 id="engineering-title">Agent 的工程底座</h2>
        <p>Agent 不只是一段提示词，它仍然需要完整的软件工程能力。</p>
      </div>
    </div>

    <div class="engineering-groups clay-surface clay-surface--yellow">
      <section v-for="([group, skills], groupIndex) in GROUPS" :key="group" class="engineering-group" v-reveal="groupIndex * 50">
        <h3>{{ group }}</h3>
        <ul class="skill-cloud" :aria-label="`${group}技能`">
          <li v-for="[file, name] in skills" :key="name" class="skill-chip" data-skill>
            <img :src="`/example/技能logo/${file}.png`" :alt="name" loading="lazy">{{ name }}
          </li>
        </ul>
      </section>
    </div>
  </section>
</template>
