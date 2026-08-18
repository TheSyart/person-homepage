<script setup>
import { PROFILE, ABOUT_PARAS, SKILLS, SCHOOL_PHOTOS, HOBBIES } from '../../config';

const INFO = [
  ['博主名', PROFILE.brand],
  ['生日', PROFILE.birthday],
  ['学校', PROFILE.school],
  ['身份', PROFILE.identity]
];
</script>

<template>
  <section class="py-16 border-b hairline">
    <h2 class="font-serifSc text-3xl font-bold mb-8" v-reveal>关于我</h2>

    <!-- 信息卡 -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6 mb-10" v-reveal="60">
      <div v-for="[label, val] in INFO" :key="label">
        <p class="text-xs text-faint tracking-widest mb-1.5">{{ label }}</p>
        <p class="font-semibold">{{ val }}</p>
      </div>
    </div>

    <!-- 自我介绍 -->
    <div class="max-w-3xl mb-12" v-reveal="120">
      <p v-for="(p, i) in ABOUT_PARAS" :key="i" class="text-body leading-loose mb-4">{{ p }}</p>
    </div>

    <!-- 技能墙（22 全量） -->
    <h3 class="font-serifSc text-xl font-bold mb-5" v-reveal>技术栈</h3>
    <div class="flex flex-wrap gap-2.5 mb-12" v-reveal="60">
      <span v-for="[file, name] in SKILLS" :key="name"
        class="inline-flex items-center gap-2 border hairline bg-card hover:border-vermilion/50 rounded-full pl-1.5 pr-3.5 py-1 text-sm transition-colors">
        <img :src="`/example/技能logo/${file}.png`" :alt="name" class="w-6 h-6" loading="lazy">{{ name }}
      </span>
    </div>

    <!-- 校园照片（10 全量） -->
    <h3 class="font-serifSc text-xl font-bold mb-5" v-reveal>校园一角</h3>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12" v-reveal="60">
      <img v-for="(src, i) in SCHOOL_PHOTOS" :key="i" :src="src" alt="校园" loading="lazy"
        class="rounded-lg h-28 w-full object-cover border hairline transition-transform duration-300 hover:scale-[1.03]">
    </div>

    <!-- 兴趣爱好（压缩版） -->
    <h3 class="font-serifSc text-xl font-bold mb-5" v-reveal>兴趣爱好</h3>
    <div class="grid grid-cols-2 md:grid-cols-5 gap-3" v-reveal="60">
      <figure v-for="[name, src] in HOBBIES" :key="name" class="group">
        <img :src="src" :alt="name" loading="lazy"
          class="rounded-lg h-28 w-full object-cover border hairline transition-transform duration-300 group-hover:scale-[1.03]">
        <figcaption class="text-center text-xs text-muted mt-2">{{ name }}</figcaption>
      </figure>
    </div>
  </section>
</template>
