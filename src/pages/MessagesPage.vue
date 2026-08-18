<script setup>
import { ref, onMounted } from 'vue';

const PAGE_SIZE = 10;
const messages = ref(null);
const total = ref(0);
const page = ref(1);

const name = ref('');
const content = ref('');
const hp = ref('');           /* honeypot：正常用户看不到，机器人会填 */
const loadTs = ref(Date.now());
const sending = ref(false);
const tip = ref('');
const tipOk = ref(false);

const totalPages = ref(1);

async function load(p = 1) {
  try {
    const r = await fetch(`/api/messages/list?page=${p}&size=${PAGE_SIZE}`);
    const j = await r.json();
    messages.value = j.list || [];
    total.value = j.total || 0;
    totalPages.value = Math.max(1, Math.ceil(total.value / PAGE_SIZE));
    page.value = p;
  } catch {
    messages.value = [];
  }
}

function fmt(ts) {
  const d = new Date(ts);
  return d.toLocaleString('zh-CN', { hour12: false });
}

async function submit() {
  tip.value = '';
  if (!name.value.trim() || !content.value.trim()) {
    tip.value = '昵称和留言内容都要填哦'; tipOk.value = false; return;
  }
  sending.value = true;
  try {
    const r = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.value.trim(), content: content.value.trim(), hp: hp.value, t: loadTs.value })
    });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      tip.value = '留言成功，感谢你的到来！'; tipOk.value = true;
      name.value = ''; content.value = '';
      load(1);
    } else {
      tip.value = j.error || '提交失败，请稍后再试'; tipOk.value = false;
    }
  } catch {
    tip.value = '网络异常，请稍后再试'; tipOk.value = false;
  }
  sending.value = false;
}

onMounted(() => load(1));
</script>

<template>
  <div class="max-w-4xl mx-auto px-6 pt-16">
    <p class="text-xs tracking-[.35em] text-faint mb-4" v-reveal>GUESTBOOK</p>
    <h1 class="font-serifSc text-4xl md:text-5xl font-bold mb-4" v-reveal="60">留言板</h1>
    <p class="text-muted mb-12" v-reveal="120">来过就留个脚印吧 —— 问题、建议、碎碎念都欢迎。</p>

    <!-- 留言表单 -->
    <form class="border hairline rounded-lg bg-card p-6 mb-14" v-reveal @submit.prevent="submit">
      <div class="mb-4">
        <label class="block text-sm text-muted mb-2">昵称</label>
        <input v-model="name" type="text" maxlength="16" placeholder="怎么称呼你？"
          class="w-full border hairline rounded px-4 py-2.5 bg-paper focus:outline-none focus:border-vermilion transition-colors">
      </div>
      <div class="mb-4">
        <label class="block text-sm text-muted mb-2">留言</label>
        <textarea v-model="content" rows="4" maxlength="500" placeholder="说点什么…（500 字以内）"
          class="w-full border hairline rounded px-4 py-2.5 bg-paper focus:outline-none focus:border-vermilion transition-colors resize-y"></textarea>
      </div>
      <!-- honeypot：对真人隐藏 -->
      <input v-model="hp" type="text" tabindex="-1" autocomplete="off"
        class="absolute -left-[9999px] opacity-0 h-0 w-0" aria-hidden="true">
      <div class="flex items-center gap-4">
        <button type="submit" :disabled="sending"
          class="bg-vermilion hover:bg-vermilionDark disabled:opacity-50 text-paper font-medium px-6 py-2.5 rounded transition-colors">
          {{ sending ? '提交中…' : '发布留言' }}
        </button>
        <p v-if="tip" class="text-sm" :class="tipOk ? 'text-emerald-700' : 'text-vermilion'">{{ tip }}</p>
      </div>
    </form>

    <!-- 留言列表 -->
    <div v-if="messages === null" class="py-6 text-faint text-sm">加载中…</div>
    <template v-else>
      <p class="text-sm text-faint mb-6">共 {{ total }} 条留言</p>
      <div v-if="messages.length" class="space-y-5">
        <div v-for="m in messages" :key="m.id" class="border-b hairline pb-5">
          <div class="flex items-baseline gap-3 mb-1.5">
            <b class="font-semibold">{{ m.name }}</b>
            <time class="text-faint text-xs font-code">{{ fmt(m.time) }}</time>
          </div>
          <p class="text-body leading-relaxed whitespace-pre-wrap">{{ m.content }}</p>
        </div>
      </div>
      <p v-else class="py-6 text-faint text-sm">还没有留言，来抢沙发。</p>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="flex items-center gap-4 mt-8 text-sm">
        <button @click="load(page - 1)" :disabled="page <= 1"
          class="border hairline rounded px-4 py-1.5 bg-card disabled:opacity-40 hover:border-vermilion transition-colors">上一页</button>
        <span class="text-muted font-code">{{ page }} / {{ totalPages }}</span>
        <button @click="load(page + 1)" :disabled="page >= totalPages"
          class="border hairline rounded px-4 py-1.5 bg-card disabled:opacity-40 hover:border-vermilion transition-colors">下一页</button>
      </div>
    </template>
  </div>
</template>
