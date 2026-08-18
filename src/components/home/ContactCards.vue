<script setup>
import { PROFILE } from '../../config';
</script>

<template>
  <section class="py-16">
    <h2 class="font-serifSc text-3xl font-bold mb-3" v-reveal>联系我</h2>
    <p class="text-muted text-sm mb-8" v-reveal="60">一起探讨技术，分享创意。</p>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
      <a :href="`mailto:${PROFILE.email}`"
        class="border hairline rounded-lg bg-card p-6 text-center hover:border-vermilion/50 transition-colors" v-reveal>
        <img src="/example/平台logo/邮箱.png" alt="邮箱" class="w-9 h-9 mx-auto mb-3">
        <p class="font-bold mb-1">邮箱</p>
        <p class="text-muted text-sm break-all">{{ PROFILE.email }}</p>
      </a>
      <div class="border hairline rounded-lg bg-card p-6 text-center" v-reveal="80">
        <img src="/example/平台logo/微信.png" alt="微信" class="w-9 h-9 mx-auto mb-3">
        <p class="font-bold mb-1">微信</p>
        <p class="text-muted text-sm">{{ PROFILE.wechat }}</p>
      </div>
      <a :href="PROFILE.githubUrl" target="_blank" rel="noopener"
        class="border hairline rounded-lg bg-card p-6 text-center hover:border-vermilion/50 transition-colors" v-reveal="160">
        <img src="/example/平台logo/github.png" alt="GitHub" class="w-9 h-9 mx-auto mb-3">
        <p class="font-bold mb-1">GitHub</p>
        <p class="text-muted text-sm">TheSyart</p>
      </a>
    </div>
  </section>
</template>
