<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  value: { type: Number, default: 0 },
  suffix: { type: String, default: '' },
  duration: { type: Number, default: 900 }
});

const display = ref(0);
let raf = null;

function animate(to) {
  if (raf) cancelAnimationFrame(raf);
  const from = display.value;
  if (from === to) return;
  const start = performance.now();
  const step = (t) => {
    const p = Math.min(1, (t - start) / props.duration);
    const e = 1 - Math.pow(1 - p, 3);
    display.value = Math.round(from + (to - from) * e);
    if (p < 1) raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
}

onMounted(() => animate(props.value));
watch(() => props.value, (v) => animate(v));
onUnmounted(() => raf && cancelAnimationFrame(raf));
</script>

<template>
  <span>{{ display.toLocaleString() }}{{ suffix }}</span>
</template>
