<script setup>
import { PROFILE, ABOUT_PARAS, SCHOOL_PHOTOS, HOBBIES } from '../../config';

const INFO = [
  ['博主名', PROFILE.brand],
  ['生日', PROFILE.birthday],
  ['学校', PROFILE.school],
  ['身份', PROFILE.identity]
];
</script>

<template>
  <section class="about-section" aria-labelledby="about-heading">
    <div class="section-heading" v-reveal>
      <span class="section-index" style="background: var(--clay-green)">04</span>
      <div class="section-heading-copy">
        <h2 id="about-heading">关于我</h2>
        <p>技术、创作与生活，都是同一个人的不同侧面。</p>
      </div>
      <span class="section-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>

    <div class="about-shell clay-surface clay-surface--green" v-reveal="60">
      <div class="identity-grid">
        <div v-for="[label, value] in INFO" :key="label" class="identity-card">
          <span>{{ label }}</span><strong>{{ value }}</strong>
        </div>
      </div>

      <div class="about-copy">
        <p v-for="paragraph in ABOUT_PARAS" :key="paragraph">{{ paragraph }}</p>
      </div>

      <h3 class="subsection-title">校园一角</h3>
      <div class="photo-grid">
        <figure v-for="(src, index) in SCHOOL_PHOTOS" :key="src" class="photo-card">
          <img :src="src" :alt="`校园照片 ${index + 1}`" loading="lazy">
        </figure>
      </div>

      <h3 class="subsection-title">兴趣爱好</h3>
      <div class="hobby-grid">
        <figure v-for="[name, src] in HOBBIES" :key="name" class="hobby-card">
          <img :src="src" :alt="name" loading="lazy">
          <figcaption>{{ name }}</figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
