<script setup>
import AgentLearningPath from '../components/agents/AgentLearningPath.vue';
import EngineeringSkills from '../components/agents/EngineeringSkills.vue';
import GithubShowcase from '../components/home/GithubShowcase.vue';
</script>

<template>
  <main class="site-shell page-wrap agents-page" aria-labelledby="agents-title">
    <header class="page-intro clay-surface clay-surface--pink" v-reveal>
      <p class="page-kicker">AGENT LAB</p>
      <h1 id="agents-title" class="page-title">让 Agent 从概念走进真实任务</h1>
      <p class="page-description">从百行代码的最小循环，到记忆、规划、子代理与 Agent Team。这里是我的开源项目、教学路线和工程底座。</p>
    </header>

    <AgentLearningPath />
    <GithubShowcase />
    <EngineeringSkills />
  </main>
</template>
