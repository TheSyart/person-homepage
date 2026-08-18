<script setup>
import AboutFull from '../components/home/AboutFull.vue';
import ContactCards from '../components/home/ContactCards.vue';
import PlatformLinks from '../components/home/PlatformLinks.vue';
import VideoShowcase from '../components/home/VideoShowcase.vue';
</script>

<template>
  <main class="site-shell page-wrap about-page" aria-labelledby="about-title">
    <header class="page-intro clay-surface clay-surface--blue" v-reveal>
      <p class="page-kicker">ABOUT XIAODAN</p>
      <h1 id="about-title" class="page-title">一个持续把 Agent 做出来的人</h1>
      <p class="page-description">项目、教程、校园与生活共同组成了现在的我。</p>
    </header>

    <AboutFull />
    <VideoShowcase />
    <PlatformLinks />
    <ContactCards />
  </main>
</template>
