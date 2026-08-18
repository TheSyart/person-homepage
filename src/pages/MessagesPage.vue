<script setup>
import { ref, onMounted } from 'vue';

const PAGE_SIZE = 10;
const messages = ref(null);
const total = ref(0);
const page = ref(1);

const name = ref('');
const content = ref('');
const hp = ref('');
const loadTs = ref(Date.now());
const sending = ref(false);
const tip = ref('');
const tipOk = ref(false);
const totalPages = ref(1);

async function load(targetPage = 1) {
  try {
    const response = await fetch(`/api/messages/list?page=${targetPage}&size=${PAGE_SIZE}`);
    const data = await response.json();
    messages.value = data.list || [];
    total.value = data.total || 0;
    totalPages.value = Math.max(1, Math.ceil(total.value / PAGE_SIZE));
    page.value = targetPage;
  } catch {
    messages.value = [];
  }
}

function fmt(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', { hour12: false });
}

async function submit() {
  tip.value = '';
  if (!name.value.trim() || !content.value.trim()) {
    tip.value = '昵称和留言内容都要填哦';
    tipOk.value = false;
    return;
  }

  sending.value = true;
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value.trim(),
        content: content.value.trim(),
        hp: hp.value,
        t: loadTs.value
      })
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      tip.value = '留言成功，感谢你的到来！';
      tipOk.value = true;
      name.value = '';
      content.value = '';
      load(1);
    } else {
      tip.value = data.error || '提交失败，请稍后再试';
      tipOk.value = false;
    }
  } catch {
    tip.value = '网络异常，请稍后再试';
    tipOk.value = false;
  }
  sending.value = false;
}

onMounted(() => load(1));
</script>

<template>
  <main class="site-shell page-wrap" aria-labelledby="messages-title">
    <header class="page-hero clay-surface clay-surface--green" v-reveal>
      <p class="page-kicker">GUESTBOOK</p>
      <h1 id="messages-title" class="page-title">留言板</h1>
      <p class="page-description">来过就留个脚印吧 —— 问题、建议、碎碎念都欢迎。</p>
    </header>

    <form class="clay-form clay-surface clay-surface--yellow" aria-label="发布留言" @submit.prevent="submit" v-reveal>
      <div>
        <label for="guest-name" class="field-label">昵称</label>
        <input id="guest-name" v-model="name" type="text" maxlength="16" placeholder="怎么称呼你？" class="clay-input">
      </div>
      <div>
        <label for="guest-message" class="field-label">留言</label>
        <textarea id="guest-message" v-model="content" rows="4" maxlength="500"
          placeholder="说点什么…（500 字以内）" class="clay-input"></textarea>
      </div>
      <input v-model="hp" type="text" tabindex="-1" autocomplete="off"
        class="absolute -left-[9999px] opacity-0 h-0 w-0" aria-hidden="true">
      <div class="form-actions">
        <button type="submit" :disabled="sending" class="clay-button clay-button--pink">
          {{ sending ? '提交中…' : '发布留言' }}
        </button>
        <p class="form-status" role="status" aria-live="polite" :class="{ 'form-status--success': tipOk }">{{ tip }}</p>
      </div>
    </form>

    <div v-if="messages === null" class="loading-panel clay-surface" role="status">加载中…</div>

    <section v-else aria-labelledby="message-list-title">
      <div class="section-heading">
        <span class="section-index" style="background: var(--clay-blue)">01</span>
        <div class="section-heading-copy">
          <h2 id="message-list-title">访客留言</h2>
          <p>共 {{ total }} 条留言</p>
        </div>
      </div>

      <div v-if="messages.length" class="message-list" role="list" aria-label="访客留言列表">
        <article v-for="(message, index) in messages" :key="message.id"
          class="message-card clay-surface" :class="index % 2 ? 'clay-surface--pink' : 'clay-surface--blue'" role="listitem">
          <div class="flex flex-wrap items-baseline justify-between gap-3 mb-2">
            <strong>{{ message.name }}</strong>
            <time class="text-faint text-xs font-code">{{ fmt(message.time) }}</time>
          </div>
          <p class="text-body leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
        </article>
      </div>
      <p v-else class="empty-panel clay-surface clay-surface--pink">还没有留言，来抢沙发。</p>

      <nav v-if="totalPages > 1" class="pagination" aria-label="留言分页">
        <button type="button" @click="load(page - 1)" :disabled="page <= 1" class="clay-button">上一页</button>
        <span class="clay-pill font-code">{{ page }} / {{ totalPages }}</span>
        <button type="button" @click="load(page + 1)" :disabled="page >= totalPages" class="clay-button">下一页</button>
      </nav>
    </section>
  </main>
</template>
