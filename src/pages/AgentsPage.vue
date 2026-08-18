<script setup>
import AgentSeries from '../components/agents/AgentSeries.vue';
</script>

<template>
  <main class="site-shell page-wrap agents-page" aria-labelledby="agents-title">
    <header class="page-intro clay-surface clay-surface--pink" v-reveal>
      <p class="page-kicker">AGENT LAB</p>
      <h1 id="agents-title" class="page-title">从零，实现一个会把事做完的 Agent</h1>
      <p class="page-description">从最小循环开始，一期加入一个关键能力。视频负责讲清思路，仓库负责把每一步完整留下。</p>
    </header>

    <AgentSeries />

    <section class="agent-core-repos" aria-labelledby="agent-repos-title">
      <div class="section-heading" v-reveal>
        <span class="section-index" style="background: var(--clay-green)">02</span>
        <div class="section-heading-copy"><h2 id="agent-repos-title">从教学代码到完整项目</h2><p>一个仓库把原理拆开，另一个仓库把能力装进真实工作空间。</p></div>
      </div>
      <div class="agent-core-repos__grid">
        <a href="https://github.com/TheSyart/claude-agent-examples" target="_blank" rel="noopener" class="clay-surface clay-surface--blue clay-interactive">
          <span>LEARN</span><h3>claude-agent-examples</h3><p>十二个逐步演进的代码步骤、配套文档和九期演示材料。适合沿提交顺序动手复现。</p><b>查看教学仓库 ↗</b>
        </a>
        <a href="https://github.com/TheSyart/emperor-agent" target="_blank" rel="noopener" class="clay-surface clay-surface--green clay-interactive">
          <span>BUILD</span><h3>emperor-agent</h3><p>把多模型、工具与工作流装进 Vue WebUI 的本地 Agent 项目，验证这些能力怎样进入实际使用。</p><b>查看实战项目 ↗</b>
        </a>
      </div>
    </section>
  </main>
</template>
