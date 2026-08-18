<template>
  <span class="seal-logo" aria-hidden="true">单</span>
</template>

<style scoped>
.seal-logo {
  display: inline-grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 15px;
  color: var(--clay-ink);
  font-size: 1.12rem;
  font-weight: 900;
  line-height: 1;
  background: var(--clay-pink);
  box-shadow: var(--clay-shadow), var(--clay-inset-hi), var(--clay-inset-lo);
  transition: transform .25s var(--clay-ease);
}
</style>
