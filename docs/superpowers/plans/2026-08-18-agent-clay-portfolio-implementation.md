# Agent Clay Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redundant homepage with an animated Clay Agent portfolio, distribute all existing information across dedicated pages, remove unverified Douyin statistics, and replace both placeholder articles with 34 real published CSDN articles.

**Architecture:** Keep Vue 3, Vue Router, the existing public API contracts, and file-backed Markdown storage. The homepage becomes a thin composition of focused Hero/proof/project/latest-content components; `/agents` and `/about` own the detailed material. CSDN migration is a one-time, testable Node workflow that reads an authoritative 34-URL inventory, downloads selector-scoped Markdown through Jina Reader, cleans CSDN rendering artifacts, localizes images, validates all records, and only then deletes the two placeholder files.

**Tech Stack:** Vue 3.5, Vue Router 4, Vite 5, Tailwind CSS 3, Vitest 3, Vue Test Utils, Node.js ESM, Markdown files, Jina Reader, Chrome browser session.

**Spec:** `docs/superpowers/specs/2026-08-18-agent-clay-portfolio-redesign.md`

## Global Constraints

- Preserve `/api/articles`, `/api/videos`, `/api/messages`, all admin routes, and their response formats.
- Preserve the export names and shapes of `PROFILE`, `SNAPSHOT`, `FEATURED_REPOS`, `OTHER_REPOS`, `SKILLS`, `SCHOOL_PHOTOS`, `HOBBIES`, `MORE_PLATFORMS`, and `ABOUT_PARAS`.
- Do not add UI, animation, icon, scraping, or Markdown runtime dependencies.
- Keep all 2 featured repositories, 6 other repositories, 22 skills, 4 personal facts, 3 rewritten About paragraphs, 10 school photos, 5 hobbies, 4 additional platforms, 3 contact methods, all video records, all message states, and all external links accessible.
- Douyin `followers`, `likes`, and `works` remain present but are `null` until a reliable source verifies them.
- Import exactly 34 published CSDN articles and delete `hello-new-home.md` plus `why-all-in-ai.md` only after the 34 imported files pass validation.
- Use only transform, opacity, and border-radius for continuous motion; support `prefers-reduced-motion` completely.
- Small text must meet 4.5:1 contrast; focus indicators must meet 3:1 against every Clay surface.
- Use real list/link semantics and keep every pointer or keyboard target at least 44×44px.

## File Map

- `src/pages/HomePage.vue`: fetches two latest articles/videos and composes the reduced homepage.
- `src/pages/AgentsPage.vue`: owns GitHub facts, Agent learning path, all repositories, and all 22 engineering skills.
- `src/pages/AboutPage.vue`: owns personal facts, rewritten About copy, school photos, hobbies, platforms, contacts, Bilibili, and Douyin identity.
- `src/components/home/AgentHero.vue`: owns the full-screen soft-body Clay Hero and activation particles.
- `src/components/home/ProofStrip.vue`: renders four concise, factual proof items.
- `src/components/home/FeaturedAgentProjects.vue`: renders only the two flagship Agent repositories on the homepage.
- `src/components/home/LatestSignals.vue`: renders at most two article and two video links plus independent loading/empty states.
- `src/components/agents/AgentLearningPath.vue`: renders the 12-stage Agent curriculum in five grouped phases.
- `src/components/agents/EngineeringSkills.vue`: renders all 22 existing skills as the Agent engineering foundation.
- `src/components/home/AboutFull.vue`: renders personal facts, rewritten biography, school photos, hobbies; no skill wall.
- `src/components/home/VideoShowcase.vue`: renders verified Bilibili stats and Douyin identity without invented numbers.
- `src/config.js`: retains existing exports while updating positioning copy and nulling unverified Douyin metrics.
- `src/composables/useStats.js`: preserves GitHub/Bilibili fallback flow and accepts nullable Douyin metrics.
- `src/style.css`: owns the Clay Hero, new page layouts, accessible tokens, focus rings, Markdown lists, responsive layout, and reduced-motion rules.
- `scripts/lib/csdn-import.mjs`: pure parsing, cleanup, image rewrite, frontmatter rendering, and validation functions.
- `scripts/import-csdn.mjs`: network/file orchestration for the one-time migration.
- `scripts/data/csdn-published.json`: authoritative 34-item inventory with `id`, `title`, and canonical `url` collected from CSDN management.
- `docs/csdn-import-report.json`: generated audit report for all 34 imports.
- `api/data/articles/csdn-*.md`: the 34 real article files.
- `public/articles/csdn/<id>/`: localized images grouped by article ID.

---

### Task 1: Protect the Existing Clay Baseline

**Files:**
- Include: `package.json`, `package-lock.json`, `vitest.config.js`, `tests/**`, `src/**`, `tailwind.config.js`, `vite.config.js`
- Include: `docs/superpowers/specs/2026-08-18-agent-clay-portfolio-redesign.md`
- Include: `docs/superpowers/plans/2026-08-18-agent-clay-portfolio-implementation.md`
- Exclude: `.superpowers/**`

**Interfaces:**
- Consumes: the existing uncommitted Clay redesign on branch `feat/clay-redesign`.
- Produces: a verified baseline commit from which the Agent-focused change can be reviewed independently.

- [ ] **Step 1: Verify the current branch and isolation state**

Run:

```bash
git branch --show-current
git rev-parse --git-dir
git rev-parse --git-common-dir
git rev-parse --show-superproject-working-tree
```

Expected: branch is `feat/clay-redesign`; this checkout is not `main` or `master`; no superproject path is returned.

- [ ] **Step 2: Run the baseline test suite**

Run:

```bash
npm test
```

Expected: 12 tests pass and 0 fail. If the count has changed, inspect the full output and require 0 failures before continuing.

- [ ] **Step 3: Run the baseline production build**

Run:

```bash
npm run build
```

Expected: Vite exits 0 with no Vue compilation errors.

- [ ] **Step 4: Commit only the approved baseline**

Run:

```bash
git add package.json package-lock.json vitest.config.js tests src tailwind.config.js vite.config.js docs/superpowers
git diff --cached --check
git commit -m "feat: establish clay portfolio baseline"
```

Expected: `.superpowers/` is not staged; the commit succeeds.

---

### Task 2: Add the Agents and About Information Architecture

**Files:**
- Create: `tests/information-architecture.test.js`
- Create: `src/pages/AgentsPage.vue`
- Create: `src/pages/AboutPage.vue`
- Create: `src/components/agents/AgentLearningPath.vue`
- Create: `src/components/agents/EngineeringSkills.vue`
- Modify: `src/router.js`
- Modify: `src/components/SiteHeader.vue`
- Modify: `src/components/home/AboutFull.vue`
- Modify: `src/config.js`

**Interfaces:**
- Consumes: existing config exports and `useStats()`.
- Produces: routes `/agents` and `/about`; `AgentLearningPath` with no props; `EngineeringSkills` with no props; pages that make every existing data item reachable outside the homepage.

- [ ] **Step 1: Write the failing route and content-distribution tests**

Create `tests/information-architecture.test.js` with real page mounts and a router contract:

```js
import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import router from '../src/router';
import AgentsPage from '../src/pages/AgentsPage.vue';
import AboutPage from '../src/pages/AboutPage.vue';
import {
  ABOUT_PARAS, FEATURED_REPOS, HOBBIES, MORE_PLATFORMS,
  OTHER_REPOS, PROFILE, SCHOOL_PHOTOS, SKILLS
} from '../src/config';

const RouterLinkStub = {
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
};
const global = { directives: { reveal: {} }, stubs: { RouterLink: RouterLinkStub } };

describe('Agent 作品集信息架构', () => {
  test('注册 Agents 与 About 页面而不改变现有公开路由', () => {
    const paths = router.getRoutes().map((route) => route.path);
    ['/', '/agents', '/about', '/articles', '/articles/:slug', '/videos', '/messages']
      .forEach((path) => expect(paths).toContain(path));
  });

  test('Agents 页面完整呈现全部仓库与 22 项工程技能', () => {
    const wrapper = mount(AgentsPage, { global });
    const text = wrapper.text();
    [...FEATURED_REPOS.map((repo) => repo.name), ...OTHER_REPOS.map(([name]) => name)]
      .forEach((name) => expect(text).toContain(name));
    expect(wrapper.findAll('[data-skill]')).toHaveLength(22);
    SKILLS.forEach(([, name]) => expect(text).toContain(name));
  });

  test('About 页面完整呈现个人资料、介绍、照片、爱好、平台与联系方式', () => {
    const wrapper = mount(AboutPage, { global });
    const text = wrapper.text();
    ABOUT_PARAS.forEach((paragraph) => expect(text).toContain(paragraph));
    expect(wrapper.findAll('img[alt^="校园照片"]')).toHaveLength(10);
    SCHOOL_PHOTOS.forEach((src) => expect(wrapper.find(`img[src="${src}"]`).exists()).toBe(true));
    HOBBIES.forEach(([name]) => expect(text).toContain(name));
    MORE_PLATFORMS.forEach(({ name }) => expect(text).toContain(name));
    expect(text).toContain(PROFILE.email);
    expect(text).toContain(PROFILE.wechat);
  });
});
```

Production change caught: removing either route, dropping a repository/skill/photo/platform/contact during redistribution, or failing to mount the new pages.

- [ ] **Step 2: Run the test and verify the missing-page failure**

Run:

```bash
npx vitest run tests/information-architecture.test.js
```

Expected: FAIL because `AgentsPage.vue` and `AboutPage.vue` do not exist.

- [ ] **Step 3: Implement the new routes and navigation**

Add lazy routes before the catch-all route:

```js
{ path: '/agents', name: 'agents', component: () => import('./pages/AgentsPage.vue'), meta: { title: 'Agents' } },
{ path: '/about', name: 'about', component: () => import('./pages/AboutPage.vue'), meta: { title: '关于' } },
```

Set header links to this exact order:

```js
const LINKS = [
  { to: '/', label: '首页', exact: true },
  { to: '/agents', label: 'Agents' },
  { to: '/articles', label: '文章' },
  { to: '/videos', label: '视频' },
  { to: '/about', label: '关于' },
  { to: '/messages', label: '留言' }
];
```

- [ ] **Step 4: Implement the Agent learning path and engineering skills**

`AgentLearningPath.vue` defines five visible phases whose item counts total 12:

```js
const PHASES = [
  ['01', '基础循环', ['模型调用', '对话循环', '历史与系统提示']],
  ['02', '工具与能力', ['工具调用', 'Skills 按需加载']],
  ['03', '记忆与规划', ['三层记忆', '任务规划']],
  ['04', '多代理协作', ['子代理', 'Agent Team']],
  ['05', '协议与控制', ['MCP', 'Hooks', '目标驱动']]
];
```

Render phases as `<ol aria-label="Agent 学习路线">`; render each lesson as a real nested `<li>`.

`EngineeringSkills.vue` imports `SKILLS` and renders each entry with `data-skill`, its original logo path, and original visible name. Group labels are visual only; array entries and order remain unchanged.

- [ ] **Step 5: Implement the two pages and split AboutFull**

`AgentsPage.vue` composes a page heading, `AgentLearningPath`, existing `GithubShowcase`, and `EngineeringSkills`.

`AboutFull.vue` retains the four personal facts, all three About paragraphs, 10 school photos, and 5 hobbies, but no longer renders `SKILLS`.

`AboutPage.vue` composes `AboutFull`, `VideoShowcase`, `PlatformLinks`, and `ContactCards` inside `<main class="site-shell page-wrap">`.

- [ ] **Step 6: Update positioning copy without changing exports**

Set:

```js
roles: ['Agent 开源作者', 'AI 内容创作者', 'Agent 实践者', '教程作者'],
tagline: '我把 Agent 的关键零件拆开、讲透、重新组装——从百行代码到能规划、记忆、协作和长期工作的个人智能体。',
identity: 'AI Agent 开源作者 / 内容创作者',
```

Replace `ABOUT_PARAS` with the three approved paragraphs copied verbatim from the spec.

- [ ] **Step 7: Run the focused and full tests**

Run:

```bash
npx vitest run tests/information-architecture.test.js
npm test
```

Expected: focused test passes; existing homepage tests may now fail only where they still expect all information on `/`. Those expectations are deliberately replaced in Task 4.

- [ ] **Step 8: Commit the information architecture**

```bash
git add tests/information-architecture.test.js src/router.js src/config.js src/components/SiteHeader.vue src/components/home/AboutFull.vue src/components/agents src/pages/AgentsPage.vue src/pages/AboutPage.vue
git diff --cached --check
git commit -m "feat: split agent and about content into dedicated pages"
```

---

### Task 3: Remove Unverified Douyin Statistics

**Files:**
- Create: `tests/douyin-truth.test.js`
- Modify: `src/config.js`
- Modify: `public/data/stats.json`
- Modify: `src/composables/useStats.js`
- Modify: `src/components/home/VideoShowcase.vue`
- Modify: `tests/home-clay.test.js`

**Interfaces:**
- Consumes: `PROFILE.douyinUrl`, `PROFILE.douyinId`, nullable `SNAPSHOT.douyin` fields.
- Produces: a Douyin identity card that never converts unknown values to zero or labels a static number as current.

- [ ] **Step 1: Write the failing consumer-visible truth test**

Create a test that mounts `VideoShowcase` with `useStats()` mocked to return `followers/likes/works: null` and asserts:

```js
expect(wrapper.text()).toContain('23329202234');
expect(wrapper.text()).toContain('抖音号');
expect(wrapper.text()).not.toContain('抖音粉丝');
expect(wrapper.text()).not.toContain('2000');
expect(wrapper.get(`a[href="${PROFILE.douyinUrl}"]`)).toBeTruthy();
```

Also assert the real config contract:

```js
expect(SNAPSHOT.douyin).toEqual({ followers: null, likes: null, works: null });
```

Production change caught: restoring an invented number, coercing unknown to `0`, or removing the verified account identity/link.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/douyin-truth.test.js
```

Expected: FAIL because current config and UI still render `2000` as a follower count.

- [ ] **Step 3: Make Douyin metrics explicitly nullable**

Set the exact object in both `src/config.js` and `public/data/stats.json`:

```js
douyin: { followers: null, likes: null, works: null }
```

Keep `useStats` object merging but never apply `Number(null)` or a default `0` to these fields.

- [ ] **Step 4: Replace the Douyin counter with verified identity content**

In `VideoShowcase.vue`, show brand, `PROFILE.douyinId`, current creator-direction copy, and the external link. Remove `CountUp` usage for Douyin and remove any date attached to its old snapshot. Bilibili live/snapshot behavior remains unchanged.

- [ ] **Step 5: Run focused and full tests**

```bash
npx vitest run tests/douyin-truth.test.js
npm test
```

Expected: Douyin tests pass; no test or rendered copy expects `2000`.

- [ ] **Step 6: Commit the truth fix**

```bash
git add tests/douyin-truth.test.js tests/home-clay.test.js src/config.js src/composables/useStats.js src/components/home/VideoShowcase.vue public/data/stats.json
git diff --cached --check
git commit -m "fix: stop presenting unverified douyin metrics"
```

---

### Task 4: Build the Animated Clay Agent Homepage

**Files:**
- Create: `tests/agent-home.test.js`
- Create: `src/components/home/AgentHero.vue`
- Create: `src/components/home/ProofStrip.vue`
- Create: `src/components/home/FeaturedAgentProjects.vue`
- Create: `src/components/home/LatestSignals.vue`
- Modify: `src/pages/HomePage.vue`
- Replace expectations in: `tests/home-clay.test.js`

**Interfaces:**
- `AgentHero` consumes prop `stats` as the current `useStats()` return object and emits no application event.
- `ProofStrip` consumes prop `stats` and reads `stats.github.cae.stars` plus `stats.github.ea.stars`.
- `LatestSignals` consumes `articles: Array`, `videos: Array`, and `ready: Boolean`.
- `HomePage` fetches `/api/articles` and `/api/videos` in parallel and passes at most two rows from each response.

- [ ] **Step 1: Write the failing reduced-homepage and Hero tests**

Create `tests/agent-home.test.js` with these observable assertions:

```js
const hero = wrapper.get('section[aria-labelledby="home-title"]');
expect(hero.get('#home-title').text()).toBe('把 AI Agent 做活。');
expect(hero.get('a[href="/agents"]').text()).toContain('进入 Agent 实验室');
expect(hero.get('a[href="/videos"]').text()).toContain('观看系列视频');
expect(wrapper.get('ul[aria-label="Agent 能力证明"]').findAll(':scope > li')).toHaveLength(4);
expect(wrapper.findAll('[data-featured-agent-project]')).toHaveLength(2);
expect(wrapper.findAll('[data-latest-article]')).toHaveLength(2);
expect(wrapper.findAll('[data-latest-video]')).toHaveLength(2);
expect(wrapper.findComponent(AboutFull).exists()).toBe(false);
expect(wrapper.findComponent(PlatformLinks).exists()).toBe(false);
expect(wrapper.findComponent(ContactCards).exists()).toBe(false);
```

Mount `AgentHero` directly, activate `.agent-core` with Enter, and assert 18 `.clay-spark` elements appear, then disappear after fake timers advance 1000ms.

Production change caught: homepage regains full-profile sections, fetch limits regress to 3+, CTAs point to old destinations, or the central Clay core loses keyboard interaction/particle cleanup.

- [ ] **Step 2: Verify RED**

Run:

```bash
npx vitest run tests/agent-home.test.js
```

Expected: FAIL because the new components and reduced composition do not exist.

- [ ] **Step 3: Implement the Clay Hero DOM and interaction**

Use the approved structure:

```vue
<section class="agent-hero" aria-labelledby="home-title">
  <div class="agent-hero__copy">
    <p class="agent-hero__eyebrow">OPEN-SOURCE AGENT BUILDER · CREATOR</p>
    <h1 id="home-title">把 AI <span>Agent 做活。</span></h1>
    <p>{{ PROFILE.tagline }}</p>
    <div class="agent-hero__actions">
      <router-link to="/agents">进入 Agent 实验室</router-link>
      <router-link to="/videos">观看系列视频</router-link>
    </div>
  </div>
  <div class="agent-hero__visual">
    <button class="agent-core" type="button" @click="activate" aria-label="激活 Agent 粘土核心">
      <img :src="PROFILE.githubAvatar" alt="小单说AI GitHub 头像">
      <span>CLICK TO ACTIVATE</span>
    </button>
    <i v-for="spark in sparks" :key="spark.id" class="clay-spark" aria-hidden="true"
      :style="spark.style"></i>
  </div>
</section>
```

`activate()` resets a `squish` class, creates exactly 18 particles with deterministic IDs and direction CSS variables, and schedules particle removal after 800ms. Vue handles Enter/Space because the core is a native `<button>`.

- [ ] **Step 4: Implement the proof, projects, and latest-content components**

Proof items are exactly:

```js
[
  { label: 'claude-agent-examples', value: stats.github.cae.stars, suffix: ' ★' },
  { label: 'emperor-agent', value: stats.github.ea.stars, suffix: ' ★' },
  { label: 'Agent 学习路线', value: 12, suffix: ' 阶段' },
  { label: 'Agent 专题内容', value: 9, suffix: '+ 集' }
]
```

`FeaturedAgentProjects` maps only `FEATURED_REPOS`. `LatestSignals` uses semantic lists and real child links; it renders independent article and video empty messages when `ready` is true.

- [ ] **Step 5: Replace HomePage composition**

Keep the existing parallel fetch pattern, change both slices from `slice(0, 3)` to `slice(0, 2)`, and render only:

```vue
<AgentHero :stats="stats" />
<ProofStrip :stats="stats" />
<FeaturedAgentProjects :stats="stats" />
<LatestSignals :articles="articles" :videos="videos" :ready="contentReady" />
<nav class="home-paths" aria-label="继续探索">...</nav>
```

Remove imports and mounts for `GithubShowcase`, `VideoShowcase`, `AboutFull`, `PlatformLinks`, and `ContactCards` from HomePage.

- [ ] **Step 6: Replace obsolete homepage tests**

Rewrite `tests/home-clay.test.js` so it no longer expects all data on `/`. Preserve tests for avatar fallback, API error empty states, external featured repository links, and reduced-motion behavior. The complete-data assertions now live in `information-architecture.test.js`.

- [ ] **Step 7: Run focused and full tests**

```bash
npx vitest run tests/agent-home.test.js tests/home-clay.test.js tests/information-architecture.test.js
npm test
```

Expected: all homepage and distribution tests pass.

- [ ] **Step 8: Commit the homepage structure**

```bash
git add tests/agent-home.test.js tests/home-clay.test.js src/pages/HomePage.vue src/components/home/AgentHero.vue src/components/home/ProofStrip.vue src/components/home/FeaturedAgentProjects.vue src/components/home/LatestSignals.vue
git diff --cached --check
git commit -m "feat: build animated agent clay homepage"
```

---

### Task 5: Implement Clay Motion, Responsive Layout, and Accessibility

**Files:**
- Modify: `tests/design-system.test.js`
- Modify: `tests/detail-and-not-found.test.js`
- Modify: `src/style.css`
- Modify: `tailwind.config.js`

**Interfaces:**
- Consumes: class names created in Tasks 2–4.
- Produces: full-screen desktop Hero, mobile single-column Hero, visible focus, semantic Markdown lists, and reduced-motion shutdown.

- [ ] **Step 1: Add failing CSS behavior tests**

Extend `tests/design-system.test.js` with source-level CSS contract assertions only for behavior that JSDOM cannot animate or lay out:

```js
expect(css).toMatch(/\.agent-core\.is-squishing\s*\{[^}]*animation:\s*clay-core-squish/s);
expect(css).toMatch(/@keyframes\s+clay-core-morph/);
expect(css).toMatch(/@keyframes\s+clay-core-squish/);
expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.clay-spark[\s\S]*animation:\s*none/s);
expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*\.agent-hero[\s\S]*grid-template-columns:\s*1fr/s);
```

Keep the existing deep focus-ring and text-contrast checks. Keep Markdown computed-style checks in `detail-and-not-found.test.js`.

Production change caught: replacing soft-body animation with plain floating, dropping reduced-motion, restoring invisible focus, or removing ordered/unordered list markers.

- [ ] **Step 2: Verify RED**

```bash
npx vitest run tests/design-system.test.js tests/detail-and-not-found.test.js
```

Expected: new Hero animation/responsive assertions fail.

- [ ] **Step 3: Port the approved V3 visual system**

Add focused styles for `.agent-hero`, `.agent-core`, four satellites, halo/orbits, `.clay-spark`, Hero title, CTA buttons, proof strip, project cards, and latest signals. Use the approved palette:

```css
--clay-bg: #f6f1ff;
--clay-blue: #bde0fe;
--clay-pink: #ffd6e0;
--clay-green: #c8f7dc;
--clay-yellow: #fff1c9;
--clay-ink: #5b4a6e;
--clay-ink-muted: #6f5e82;
```

The core uses asymmetrical `border-radius` values at 0/25/50/75/100%, layered outer shadow, top-left inner highlight, and bottom-right inner shadow. `clay-core-squish` scales through `1 → 1.14/.76 → .91/1.12 → 1.04/.96 → 1`.

- [ ] **Step 4: Implement responsive and reduced-motion behavior**

At `max-width: 1020px`, stack the Hero. At `max-width: 640px`, use one column, prevent title/CTA overflow, size the visual core within `min(86vw, 360px)`, and keep all navigation links visible in wrapped rows.

In the reduced-motion block, set continuous Hero animations and parallax transforms to `none`; hide generated particles; keep focus and active-state feedback immediate.

- [ ] **Step 5: Fix contrast, focus, and Markdown semantics**

- Use `--clay-ink` or `--clay-ink-muted` for all text below 18px.
- Retain `#8a7aa0` only for decorative large text.
- Use `outline: 3px solid var(--clay-ink)` with a 3px light offset/box-shadow separation for `:focus-visible`.
- Keep `.article-body ul { list-style: disc; }` and `.article-body ol { list-style: decimal; }` with nested padding.
- Keep links as links; lists use wrapper `<li>` elements rather than role overrides.

- [ ] **Step 6: Run CSS tests and build**

```bash
npx vitest run tests/design-system.test.js tests/detail-and-not-found.test.js
npm test
npm run build
```

Expected: all tests pass and Vite exits 0.

- [ ] **Step 7: Commit visual implementation**

```bash
git add tests/design-system.test.js tests/detail-and-not-found.test.js src/style.css tailwind.config.js
git diff --cached --check
git commit -m "feat: add soft-body clay motion and accessible responsive styles"
```

---

### Task 6: Build a Tested CSDN Importer

**Files:**
- Create: `tests/fixtures/csdn-reader-sample.md`
- Create: `tests/csdn-import.test.js`
- Create: `scripts/lib/csdn-import.mjs`
- Create: `scripts/import-csdn.mjs`
- Modify: `package.json`

**Interfaces:**
- `parseReaderDocument(raw: string): CsdnRecord`
- `cleanCsdnMarkdown(markdown: string, sourceUrl: string): string`
- `renderArticle(record: CsdnRecord): string`
- `validateInventory(items: InventoryItem[], expectedCount = 34): void`
- `importInventory(items, options): Promise<ImportReport[]>`
- `CsdnRecord = { id, title, date, summary, tags, sourceUrl, content }`

- [ ] **Step 1: Write the failing parser and validation tests**

Use a shortened real-format Jina fixture with `Title:`, `URL Source:`, `Published Time:`, `Markdown Content:`, an empty CSDN heading anchor, a fenced Python block, the `python / 运行 / line-number list` artifact, and an image ending in `#pic_center`.

Assert literal results:

```js
expect(record).toMatchObject({
  id: '161193349',
  title: '从零实现自己的agent第五期：子代理实现',
  date: '2026-05-18',
  tags: ['Agent', 'Subagent', '上下文隔离', '并发', 'Tool Use']
});
expect(record.content).toContain('```python');
expect(record.content).not.toContain('\n运行\n');
expect(record.content).not.toMatch(/^\*\s+1$/m);
expect(record.content).not.toContain('[](');
expect(record.content).not.toContain('#pic_center');
```

Use exact frontmatter assertions instead of the final broad assertion:

```js
const file = renderArticle(record);
expect(file).toContain('title: "从零实现自己的agent第五期：子代理实现"');
expect(file).toContain('date: 2026-05-18');
expect(file).toContain('tags: ["Agent", "Subagent", "上下文隔离", "并发", "Tool Use"]');
expect(file).toContain('draft: false');
expect(file).toContain('[原文发布于 CSDN](https://blog.csdn.net/m0_70561094/article/details/161193349)');
```

Test that `validateInventory` rejects 33 items, duplicate IDs, mismatched URL IDs, and empty titles; test that a hand-built valid 34-item array passes.

Production change caught: wrong IDs/dates, CSDN code line-number pollution, broken frontmatter quoting, duplicate/incomplete inventory, or lost source traceability.

- [ ] **Step 2: Verify RED**

```bash
npx vitest run tests/csdn-import.test.js
```

Expected: FAIL because `scripts/lib/csdn-import.mjs` does not exist.

- [ ] **Step 3: Implement pure parser and renderer functions**

`parseReaderDocument` extracts metadata headers and content after `Markdown Content:`. `cleanCsdnMarkdown` must:

1. Remove duplicated empty anchor syntax from headings while retaining heading text.
2. Detect a fenced block followed by a language label (`text`, `bash`, `shell`, `java`, `javascript`, `typescript`, `python`, `dart`, `json`, `yaml`, `xml`, `html`, `css`) and move the label to the opening fence.
3. Remove the accompanying `运行`, run-code icon, and contiguous numeric line-number list.
4. Remove `#pic_center` fragments without changing the image URL.
5. Collapse more than two consecutive blank lines.
6. Extract `**标签**：` values into trimmed tags and retain the visible label paragraph in the body.
7. Derive summary from `**摘要**：` or the first prose paragraph, strip Markdown syntax, and cap at 180 characters.

`renderArticle` JSON-quotes title/summary/tag strings so colons, brackets, and quotes cannot corrupt the existing simple frontmatter parser.

- [ ] **Step 4: Implement network and image orchestration**

For each inventory URL, request:

```js
await fetch(`https://r.jina.ai/${item.url}`, {
  headers: { 'X-Target-Selector': '#content_views' }
});
```

Find Markdown image URLs, download each to `public/articles/csdn/<id>/image-<n>.<ext>`, and rewrite the link to `/articles/csdn/<id>/image-<n>.<ext>`. If an image request fails, keep its remote URL and record `imageStatus: 'remote-fallback'` in the report.

Write article files only to a temporary directory first. Validate count, unique IDs, non-empty content over 200 characters, balanced code fences, and existence of every localized image. After validation, atomically move all 34 files into `api/data/articles/` and remove only the two named placeholder files.

- [ ] **Step 5: Add the explicit import command**

Add:

```json
"import:csdn": "node scripts/import-csdn.mjs"
```

The command reads `scripts/data/csdn-published.json`, requires exactly 34 valid items, and writes `docs/csdn-import-report.json`.

- [ ] **Step 6: Run importer tests**

```bash
npx vitest run tests/csdn-import.test.js
npm test
```

Expected: all parser, validation, and existing site tests pass without network access in tests.

- [ ] **Step 7: Commit the importer**

```bash
git add tests/fixtures/csdn-reader-sample.md tests/csdn-import.test.js scripts/lib/csdn-import.mjs scripts/import-csdn.mjs package.json package-lock.json
git diff --cached --check
git commit -m "feat: add validated csdn article importer"
```

---

### Task 7: Collect and Import All 34 Published CSDN Articles

**Files:**
- Create: `scripts/data/csdn-published.json`
- Create: `docs/csdn-import-report.json`
- Create: `api/data/articles/csdn-*.md` (exactly 34)
- Create: `public/articles/csdn/<id>/**`
- Delete: `api/data/articles/hello-new-home.md`
- Delete: `api/data/articles/why-all-in-ai.md`

**Interfaces:**
- Consumes: the logged-in Chrome CSDN management page and `npm run import:csdn`.
- Produces: 34 local article files plus a 34-row audit report; public article API continues reading the same directory and frontmatter shape.

- [ ] **Step 1: Capture the authoritative two-page inventory**

In the already logged-in CSDN management tab, collect only rows under “已发布”. For page 1 and page 2, capture public links matching:

```js
Array.from(document.querySelectorAll('a[href*="blog.csdn.net/m0_70561094/article/details/"]'))
  .map((a) => ({ title: a.textContent.trim(), url: a.href }))
  .filter((row) => row.title && /\/article\/details\/\d+/.test(row.url));
```

Deduplicate by numeric ID. Save the exact 34 rows as:

```json
[
  {
    "id": "161193349",
    "title": "从零实现自己的agent第五期：子代理实现",
    "url": "https://blog.csdn.net/m0_70561094/article/details/161193349"
  }
]
```

The example shows the schema; the saved file contains all 34 real rows. Do not include the 3 drafts.

- [ ] **Step 2: Validate inventory before downloading**

Run:

```bash
node -e "import('./scripts/lib/csdn-import.mjs').then(({validateInventory}) => { const fs=require('node:fs'); validateInventory(JSON.parse(fs.readFileSync('scripts/data/csdn-published.json','utf8')),34); console.log('inventory valid: 34'); })"
```

Expected: `inventory valid: 34`.

- [ ] **Step 3: Run the full import**

Run:

```bash
npm run import:csdn
```

Expected: 34 successes; no placeholder file is deleted before the final validation stage; any network/image fallback is named in the report.

- [ ] **Step 4: Verify article storage and public parsing**

Run:

```bash
find api/data/articles -maxdepth 1 -name 'csdn-*.md' | wc -l
test ! -e api/data/articles/hello-new-home.md
test ! -e api/data/articles/why-all-in-ai.md
node -e "const store=require('./api/store'); const rows=store.listArticles(); if(rows.length!==34) throw new Error('expected 34, got '+rows.length); console.log(rows.length)"
```

Expected: `34` from both counts and both placeholder checks succeed.

- [ ] **Step 5: Audit migrated content**

Run a validation script that checks every report row has:

- matching inventory ID/title/source URL;
- a non-empty `api/data/articles/csdn-<id>.md`;
- date in `YYYY-MM-DD` form;
- content longer than 200 characters;
- balanced triple-backtick fences;
- every local image path present;
- no `#pic_center`, CSDN empty anchor heading, run-code icon, or standalone generated line-number block.

Expected: 34 passed, 0 failed. Open at least one Agent article, one Flutter article, and one older article in the local site and compare title, headings, code, lists, and images against the CSDN originals.

- [ ] **Step 6: Run tests and build with real content**

```bash
npm test
npm run build
```

Expected: all tests and the build pass with 34 articles.

- [ ] **Step 7: Commit the real article library**

```bash
git add scripts/data/csdn-published.json docs/csdn-import-report.json api/data/articles public/articles/csdn
git diff --cached --check
git commit -m "content: replace placeholder posts with 34 csdn articles"
```

---

### Task 8: Full Browser Verification and Completion

**Files:**
- Modify if failures reveal defects: files owned by Tasks 2–7
- Update: `docs/superpowers/specs/2026-08-18-agent-clay-portfolio-redesign.md` status to `已实现` only after every gate passes

**Interfaces:**
- Consumes: complete implementation and 34-article dataset.
- Produces: verified branch ready for user review.

- [ ] **Step 1: Run automated verification from a clean command**

```bash
npm test
npm run build
git diff --check
```

Expected: 0 failures, 0 build errors, 0 whitespace errors.

- [ ] **Step 2: Start the local frontend and API**

Run the existing API command from its package and `npm run dev -- --host 127.0.0.1`. Confirm Vite uses the existing `/api` proxy to `127.0.0.1:3081`.

- [ ] **Step 3: Verify all routes at three viewports**

At 1440×1000, 768×1024, and 390×844, inspect:

- `/`
- `/agents`
- `/about`
- `/articles`
- 3 article details: Agent, Flutter, and older article
- `/videos`
- `/messages`
- an unknown 404 path

For each, require no horizontal overflow, no clipped CTA, correct loading/empty/error states, visible keyboard focus, and no application console error/warning.

- [ ] **Step 4: Verify Hero interaction and reduced motion**

Use mouse and keyboard to activate the Clay core. Confirm soft-body compression/rebound and automatic particle cleanup. Emulate `prefers-reduced-motion: reduce`; confirm continuous morph, float, parallax, typing, and particles stop while all content and controls remain available.

- [ ] **Step 5: Verify complete content distribution**

Confirm 2 flagship repositories, 6 other repositories, 12 learning stages, 22 skills, 4 personal facts, 3 new About paragraphs, 10 school photos, 5 hobbies, 4 additional platforms, 3 contact methods, all videos, and 34 articles are reachable. Confirm no visible page contains the two deleted placeholder titles or an unverified Douyin number.

- [ ] **Step 6: Mark the specification implemented and commit final fixes**

Change only the spec status line to `状态：已实现`. Then run:

```bash
git add docs/superpowers/specs/2026-08-18-agent-clay-portfolio-redesign.md
git add -u
git diff --cached --check
git commit -m "chore: complete agent clay portfolio verification"
```

Expected: final commit contains only verification-driven fixes and the status update; `.superpowers/` remains untracked.
