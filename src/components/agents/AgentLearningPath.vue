<script setup>
const PHASES = [
  ['01', '基础循环', ['模型调用', '对话循环', '历史与系统提示']],
  ['02', '工具与能力', ['工具调用', 'Skills 按需加载']],
  ['03', '记忆与规划', ['三层记忆', '任务规划']],
  ['04', '多代理协作', ['子代理', 'Agent Team']],
  ['05', '协议与控制', ['MCP', 'Hooks', '目标驱动']]
];
</script>

<template>
  <section class="agent-path-section" aria-labelledby="agent-path-title">
    <div class="section-heading" v-reveal>
      <span class="section-index">01</span>
      <div class="section-heading-copy">
        <h2 id="agent-path-title">从零实现 Agent</h2>
        <p>把复杂系统拆成 12 个可以运行、验证和继续扩展的阶段。</p>
      </div>
    </div>

    <ol class="agent-path" aria-label="Agent 学习路线">
      <li v-for="([index, title, lessons], phaseIndex) in PHASES" :key="index"
        class="agent-path-phase clay-surface" :class="`agent-path-phase--${phaseIndex + 1}`" v-reveal="phaseIndex * 60">
        <div class="agent-path-phase__heading">
          <span>{{ index }}</span>
          <h3>{{ title }}</h3>
        </div>
        <ol>
          <li v-for="lesson in lessons" :key="lesson" data-agent-lesson>{{ lesson }}</li>
        </ol>
      </li>
    </ol>
  </section>
</template>
