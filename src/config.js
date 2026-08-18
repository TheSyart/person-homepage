/* 站点内容与兜底快照 —— 文案/链接/静态数据集中在这里维护 */

export const PROFILE = {
  brand: '小单说AI',
  roles: ['全栈程序员', '开源作者', '技术博主', '视频创作者'],
  tagline: '安徽三联学院计算机专业本科生。专注 Java 后端与 Vue 前端，也写 Python 爬虫和 Flutter。在 GitHub 做开源，在 B站 / 抖音讲 AI、讲编程。',
  birthday: '2002.10.28',
  school: '安徽三联学院 · 计算机专业',
  identity: '全栈程序员 / 技术博主',
  hobby: '运动（篮球 · 滑雪）',
  email: '1359086121@qq.com',
  wechat: 'DaXueSheng',
  githubUrl: 'https://github.com/TheSyart',
  githubReposUrl: 'https://github.com/TheSyart?tab=repositories',
  bilibiliUrl: 'https://space.bilibili.com/1452412374',
  douyinUrl: 'https://www.douyin.com/user/MS4wLjABAAAAk5lgbm96yoPPEoGXoY3MIp4S8voya0dzcnG0Lom5-SI?from_tab_name=main',
  douyinId: '23329202234',
  githubAvatar: 'https://avatars.githubusercontent.com/u/141762452?v=4',
  biliAvatar: 'https://i0.hdslb.com/bfs/face/e8e3d0b1a2fc775d43224c9af22edbb9766a4a03.jpg',
  biliSign: '分享ai 学习ai 诸君共进步'
};

/* 内嵌快照（2026-08-18）—— 实时接口与 stats.json 都失败时的最后兜底 */
export const SNAPSHOT = {
  updated: '2026-08-18',
  github: {
    followers: 18,
    repos: 9,
    totalStars: 530,
    cae: { stars: 355, forks: 94 },
    ea: { stars: 175, forks: 40 }
  },
  bilibili: { followers: 3164, name: '小单说AI', face: '', sign: '分享ai 学习ai 诸君共进步' },
  douyin: { followers: 2000, likes: 0, works: 6 }
};

export const FEATURED_REPOS = [
  {
    key: 'cae',
    name: 'claude-agent-examples',
    lang: 'HTML',
    langColor: '#e34c26',
    icon: 'robot',
    desc: 'Claude Agent 示例集 —— 从简单到复杂，循序渐进的智能体开发实战。',
    url: 'https://github.com/TheSyart/claude-agent-examples'
  },
  {
    key: 'ea',
    name: 'emperor-agent',
    lang: 'TypeScript',
    langColor: '#3178c6',
    icon: 'crown',
    desc: '本地「皇帝」风 AI Agent —— Vue WebUI、多模型供应商，开箱即用。',
    url: 'https://github.com/TheSyart/emperor-agent'
  }
];

export const OTHER_REPOS = [
  ['myhero', 'Dart', 7],
  ['oh-my-skills', 'Python', 4],
  ['dxs_demo', 'JavaScript', 2],
  ['pet-platform-web', 'Vue', 2],
  ['pet-platform-springboot', 'Java', 1],
  ['extra-link', 'Python', 0]
];

export const SKILLS = [
  ['java', 'Java'], ['SPRINGBOOT', 'Spring Boot'], ['SpringCloud', 'Spring Cloud'],
  ['Vue', 'Vue'], ['Element', 'Element'], ['html', 'HTML'], ['css', 'CSS'],
  ['javascript', 'JavaScript'], ['typescript', 'TypeScript'], ['markdown', 'Markdown'],
  ['Python', 'Python'], ['Flutter', 'Flutter'], ['Dart', 'Dart'], ['Android', 'Android'],
  ['MYSQL', 'MySQL'], ['Redis', 'Redis'], ['mongodb', 'MongoDB'], ['Docker', 'Docker'],
  ['github', 'Git'], ['剪映', '剪映'], ['视频制作', '视频制作'], ['技术写作', '技术写作']
];

export const SCHOOL_PHOTOS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `/example/学校/学校${n}.jpg`);

export const HOBBIES = [
  ['篮球', '/example/兴趣爱好/篮球.jpg'],
  ['滑雪', '/example/兴趣爱好/滑雪.jpg'],
  ['游戏', '/example/兴趣爱好/游戏.jpg'],
  ['电影', '/example/兴趣爱好/电影.jpg'],
  ['养鸟', '/example/兴趣爱好/养鸟.jpg']
];

/* 原始自我介绍三段 */
export const ABOUT_PARAS = [
  '我是小单说AI，一名来自安徽三联学院计算机专业的本科生。作为一名全栈程序员，我专注于 Java 后端开发和 Vue 前端技术，同时也热衷于 Python 爬虫和 Flutter 移动端开发。',
  '我不仅是一名技术开发者，更是一名内容创作者。在 B站、抖音等平台分享 AI 与编程知识，通过视频和文章帮助更多人入门。我相信技术的力量，也相信分享的价值。',
  '除了编程，我还热爱运动，这让我保持积极向上的生活态度，也为创作提供了源源不断的灵感。'
];

export const MORE_PLATFORMS = [
  { name: '快手', icon: '/example/平台logo/快手.png', url: 'https://www.kuaishou.com/profile/3x78hzmnhvqnx3g' },
  { name: 'CSDN', icon: '/example/平台logo/csdn博客.png', url: 'https://blog.csdn.net/m0_70561094' },
  { name: '掘金', icon: '/example/平台logo/juejin.png', url: 'https://juejin.cn/user/3125273628517148' },
  { name: '知乎', icon: '/example/平台logo/知乎.png', url: 'https://www.zhihu.com/people/thesyart-6' }
];
