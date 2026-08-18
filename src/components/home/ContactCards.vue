<script setup>
import { PROFILE } from '../../config';
</script>

<template>
  <section class="contact-section" aria-labelledby="contact-heading">
    <div class="section-heading" v-reveal>
      <span class="section-index" style="background: var(--clay-pink)">06</span>
      <div class="section-heading-copy">
        <h2 id="contact-heading">联系我</h2>
        <p>一起探讨技术，分享创意。</p>
      </div>
      <span class="section-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>

    <div class="contact-grid">
      <a :href="`mailto:${PROFILE.email}`" class="contact-card clay-surface clay-surface--blue clay-interactive" v-reveal>
        <img src="/example/平台logo/邮箱.png" alt="邮箱">
        <strong>邮箱</strong><span>{{ PROFILE.email }}</span>
      </a>
      <div class="contact-card clay-surface clay-surface--pink" v-reveal="60">
        <img src="/example/平台logo/微信.png" alt="微信">
        <strong>微信</strong><span>{{ PROFILE.wechat }}</span>
      </div>
      <a :href="PROFILE.githubUrl" target="_blank" rel="noopener"
        class="contact-card clay-surface clay-surface--yellow clay-interactive" v-reveal="120">
        <img src="/example/平台logo/github.png" alt="GitHub">
        <strong>GitHub</strong><span>TheSyart</span>
      </a>
    </div>
  </section>
</template>
