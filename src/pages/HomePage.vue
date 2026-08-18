<script setup>
import AgentHero from '../components/home/AgentHero.vue';
import LivePlatformBoard from '../components/home/LivePlatformBoard.vue';
import { useStats } from '../composables/useStats';

const stats = useStats();
</script>

<template>
  <main class="home-main">
    <AgentHero :stats="stats" />
    <LivePlatformBoard :stats="stats" />
  </main>
</template>
