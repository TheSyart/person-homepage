<script setup>
import { computed } from 'vue';
import CountUp from '../CountUp.vue';

const props = defineProps({
  stats: { type: Object, required: true }
});

const proofs = computed(() => [
  { label: 'claude-agent-examples', value: props.stats.github.cae.stars, suffix: ' ★', tone: 'blue' },
  { label: 'emperor-agent', value: props.stats.github.ea.stars, suffix: ' ★', tone: 'pink' },
  { label: 'Agent 学习路线', value: 12, suffix: ' 阶段', tone: 'green' },
  { label: 'Agent 专题内容', value: 9, suffix: '+ 集', tone: 'yellow' }
]);
</script>

<template>
  <ul class="agent-proof-strip site-shell" aria-label="Agent 能力证明">
    <li v-for="proof in proofs" :key="proof.label" class="agent-proof clay-surface" :class="`clay-surface--${proof.tone}`">
      <strong><CountUp :value="proof.value" :suffix="proof.suffix" /></strong>
      <span>{{ proof.label }}</span>
    </li>
  </ul>
</template>
