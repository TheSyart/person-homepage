<template>
  <span class="seal-logo" aria-hidden="true">
    <img src="/assets/clay/favicon/xiaodan-clay-64.png" alt="" width="42" height="42">
  </span>
</template>

<style scoped>
.seal-logo {
  display: inline-block;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  line-height: 0;
  transition: transform .25s var(--clay-ease);
}

.seal-logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
