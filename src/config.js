/* 站点内容与兜底快照 —— 文案/链接/静态数据集中在这里维护 */

export const PROFILE = {
  brand: '小单说AI',
  roles: ['Agent 开源作者', 'AI 内容创作者', 'Agent 实践者', '教程作者'],
  tagline: '我把 Agent 的关键零件拆开、讲透、重新组装——从百行代码到能规划、记忆、协作和长期工作的个人智能体。',
  birthday: '2002.10.28',
  school: '安徽三联学院 · 计算机专业',
  identity: 'AI Agent 开源作者 / 内容创作者',
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
  '我是小单，一个把 AI Agent 做成开源项目，也把实现过程讲给别人听的创作者。比起停留在模型演示，我更关心 Agent 怎样调用工具、保留记忆、规划任务，并把一件事真正做完。',
  '从模型调用、工具与 Skills，到记忆、任务规划、子代理、Agent Team、MCP 和 Hooks，我正在用代码、视频和真实项目搭建一条可以复现的 Agent 学习路线。claude-agent-examples 负责把原理逐步拆开，emperor-agent 则尝试把这些能力装进一个可以长期使用的个人工作空间。',
  '我也持续体验 Claude、Codex、DeepSeek、Kimi 等 AI 编程工具。关注的不是简单的模型排行榜，而是它们能否进入真实开发流程、稳定完成任务，并逐渐成为可以长期协作的个人 Agent。校园经历、传统开发技能和兴趣仍是我的背景，但不再占据首页的中心位置。'
];

export const MORE_PLATFORMS = [
  { name: '快手', icon: '/example/平台logo/快手.png', url: 'https://www.kuaishou.com/profile/3x78hzmnhvqnx3g' },
  { name: 'CSDN', icon: '/example/平台logo/csdn博客.png', url: 'https://blog.csdn.net/m0_70561094' },
  { name: '掘金', icon: '/example/平台logo/juejin.png', url: 'https://juejin.cn/user/3125273628517148' },
  { name: '知乎', icon: '/example/平台logo/知乎.png', url: 'https://www.zhihu.com/people/thesyart-6' }
];
