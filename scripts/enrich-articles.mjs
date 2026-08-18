import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('api/data/articles');

const summaries = {
  'csdn-134781227': '复盘 Android 模拟器中页面跳转后闪退的问题，从 Activity 注册、Intent 参数和日志定位入手，梳理一套适合初学者的排错顺序。',
  'csdn-145479205': '介绍宠物护理毕业设计的 Android 客户端，涵盖项目定位、移动端技术栈、主要页面与业务流程，并给出源码获取和后续学习入口。',
  'csdn-145494350': '展示宠物护理平台的 Web 管理端，从登录、数据统计到业务管理页面，说明前端技术选择以及它和移动端、后端之间的协作方式。',
  'csdn-145495254': '拆解宠物护理平台的 Spring Boot 服务端，介绍工程结构、核心依赖和接口职责，并说明它如何为 Android 与 Web 两个客户端提供数据。',
  'csdn-147255096': '一篇赛博修仙小说的开篇。老程序员李程在 AI 代码审查时代倒下，醒来后进入算力即灵气、报错即天劫的云寰世界。',
  'csdn-151962390': '整理 Flutter 项目卡在 assembleDebug 或虚拟机无法启动时的常见原因，重点排查 Gradle 下载、跨盘路径、环境配置和详细日志。',
  'csdn-152053494': '从关键点、运行模式和输入输出讲清 Google ML Kit Pose Detection，并说明 Flutter 应用怎样选择模型和组织姿态识别流程。',
  'csdn-152084278': '比较 Flutter 液态玻璃效果的两种实现路径：手写 Shader 与现成组件库，并通过示例分析折射、模糊、拖拽和性能取舍。',
  'csdn-152173543': '用 Flutter、视频逐帧处理和 ML Kit 完成篮球动作识别，串起帧提取、人体关键点、骨骼绘制、状态判断与拍球计数。',
  'csdn-152314178': '从石斧、工业机器到生成式 AI 回顾工具演变，讨论普通人在效率快速提升时遇到的职业压力，以及应该怎样重新建立自己的能力。',
  'csdn-153031679': '从状态与界面更新的关系讲起，介绍 GetX 响应式和简单状态管理的写法，帮助 Flutter 初学者理解数据变化如何驱动组件。',
  'csdn-153196630': '记录为 CSDN 写作需求开发视频转无水印 GIF 插件的全过程，包括问题来源、产品设计、项目结构、插件清单和核心处理流程。',
  'csdn-153276687': '系统梳理 GetX 路由管理，从路由和路由栈的基本概念，到命名路由、参数传递、中间件以及页面返回的实际写法。',
  'csdn-153320693': '体验并部署代码质量分析工具 fuck-u-code，说明它如何扫描项目、计算分数和定位问题，同时记录 Go 安装与实际使用步骤。',
  'csdn-153413176': '解释依赖、依赖注入与服务定位的区别，并逐步演示 Get.put、Get.lazyPut、Get.find 等 GetX 依赖管理方式及生命周期。',
  'csdn-153729984': '从节日头像的使用场景出发，完整记录 FuncAvatar 的产品构思、处理流程、项目结构和实现细节，让头像装饰可以快速复用。',
  'csdn-153876471': '面向第一次接触树莓派的读者，介绍硬件特点、常见型号和应用场景，并逐步完成系统镜像选择、烧录、启动与基础配置。',
  'csdn-153881538': '记录一次零代码个人门户开发：先梳理需求与页面结构，再用 MasterGo 完成 UI，最后借助 Trae 生成、调试并部署网站。',
  'csdn-154127844': '从移动端网络请求库的演进切入，讲解 Flutter Dio 的请求配置、拦截器、错误处理与封装方式，建立可维护的网络层。',
  'csdn-154185463': '从一次无法复制网页内容的经历出发，拆解 HTML、CSS 和 JavaScript 常见限制手段，并说明浏览器端内容为何仍能被检查和读取。',
  'csdn-154545037': '记录用 Flutter 在一天内完成并上架功德木鱼应用的过程，覆盖需求取舍、素材准备、交互开发、打包测试和商店发布。',
  'csdn-154795592': '以普通使用者的视角回看 2025 年 AI 工具变化，从 DeepSeek、MCP 到 Trae Solo，讨论这些能力怎样进入学习与开发流程。',
  'csdn-155537436': 'Flutter 像素游戏系列第一篇，介绍 Flame、素材和精灵图，并从零搭建 MyHero 项目，让主角完成加载、动画与基础移动。',
  'csdn-155710416': 'Flutter 像素游戏系列第二篇，使用 Tiled 创建地图与图块集，再把地图资源加载进 Flame，建立可继续扩展的关卡场景。',
  'csdn-155748969': '从木鱼应用未通过审核后的新想法出发，记录一款答题应用的流程设计、素材准备、功能开发和重新上架尝试的完整过程。',
  'csdn-155827109': '拆解豆包手机自动操作应用的可能实现，围绕屏幕感知、后台执行和任务循环，解释视觉理解、动作规划与系统权限如何配合。',
  'csdn-155982412': 'Flutter 像素游戏系列第三篇，补齐人物与墙体、地图物件的碰撞和交互，让角色不再只是覆盖在地图上移动。',
  'csdn-156114676': 'Flutter 像素游戏系列第四篇，加入 HUD、敌人、攻击与伤害反馈，并处理角色滑步问题，搭出一套可以继续调参的战斗循环。',
  'csdn-156300781': 'Flutter 像素游戏系列第五篇，借鉴随机地牢的关卡结构，统一加载器并组合房间、出口和敌人，生成每局不同的探索路线。',
  'csdn-161188929': '区分聊天机器人与 Agent，解释模型、运行时、工具和观察如何组成行动闭环，并讨论权限、失败恢复与自动化边界。',
  'csdn-161193084': '用百行 Python 从一次模型调用搭出最小 Agent，逐步加入 history、system prompt、工具协议和执行循环，直观看清运行机制。',
  'csdn-161193179': '为 Agent 设计可落盘的三层记忆与自动压缩机制，把过长 history 变成可继续使用的摘要，并保留关键任务事实。',
  'csdn-161193263': '把复杂任务的 TODO 从模型脑内搬到外部状态，通过 update_todos、提示约束和残单检查，让 Agent 能规划并追踪执行进度。',
  'csdn-161193349': '把网页、命令和搜索等脏活交给独立 Subagent，讲清任务派发、工具白名单、并发、上下文隔离与结果回传。'
};

const generatedCovers = {
  'csdn-134781227': '/assets/clay/articles/android-avd-crash.png',
  'csdn-145479205': '/assets/clay/articles/pet-care-android.png',
  'csdn-145494350': '/assets/clay/articles/pet-care-web.png',
  'csdn-145495254': '/assets/clay/articles/pet-care-spring.png',
  'csdn-147255096': '/assets/clay/articles/goodbye-world.png',
  'csdn-151962390': '/assets/clay/articles/flutter-android-studio.png',
  'csdn-152053494': '/assets/clay/articles/mlkit-pose-basics.png',
  'csdn-152084278': '/assets/clay/articles/liquid-glass.png',
  'csdn-152173543': '/assets/clay/articles/pose-detection.png',
  'csdn-152314178': '/assets/clay/articles/tools-to-ai.png',
  'csdn-153031679': '/assets/clay/articles/getx-state.png',
  'csdn-153196630': '/assets/clay/articles/video-to-gif.png',
  'csdn-153276687': '/assets/clay/articles/getx-routing.png',
  'csdn-153320693': '/assets/clay/articles/code-quality.png',
  'csdn-153413176': '/assets/clay/articles/getx-dependency.png',
  'csdn-153729984': '/assets/clay/articles/func-avatar.png',
  'csdn-153876471': '/assets/clay/articles/raspberry-pi.png',
  'csdn-153881538': '/assets/clay/articles/zero-code-portal.png',
  'csdn-154127844': '/assets/clay/articles/dio-network.png',
  'csdn-154185463': '/assets/clay/articles/no-copy.png',
  'csdn-154545037': '/assets/clay/articles/flutter-wooden-fish.png',
  'csdn-154795592': '/assets/clay/articles/ai-2025.png',
  'csdn-155537436': '/assets/clay/articles/flame-hero.png',
  'csdn-155710416': '/assets/clay/articles/flame-map.png',
  'csdn-155748969': '/assets/clay/articles/quiz-app.png',
  'csdn-155827109': '/assets/clay/articles/doubao-automation.png',
  'csdn-155982412': '/assets/clay/articles/flame-collision.png',
  'csdn-156114676': '/assets/clay/articles/flame-combat.png',
  'csdn-156300781': '/assets/clay/articles/flame-dungeon.png',
  'csdn-161188929': '/assets/clay/articles/agent-intro.png',
  'csdn-161193084': '/assets/clay/articles/agent-100-lines.png',
  'csdn-161193179': '/assets/clay/articles/agent-memory.png',
  'csdn-161193263': '/assets/clay/articles/agent-planning.png',
  'csdn-161193349': '/assets/clay/articles/agent-subagent.png'
};

for (const [slug, summary] of Object.entries(summaries)) {
  const file = path.join(root, `${slug}.md`);
  const raw = fs.readFileSync(file, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) throw new Error(`${slug} 缺少 frontmatter`);
  const originalBody = match[2];
  const title = match[1].match(/^title:\s*(.*)$/m)?.[1]?.replace(/^['"]|['"]$/g, '') || slug;
  const cover = generatedCovers[slug];
  if (!cover) throw new Error(`${slug} 没有封面`);
  const fields = new Map(match[1].split('\n').map((line) => {
    const index = line.indexOf(':');
    return index < 0 ? [line, ''] : [line.slice(0, index), line.slice(index + 1).trim()];
  }));
  fields.set('summary', `"${summary}"`);
  fields.set('cover', cover);
  fields.set('coverAlt', `"${title}文章封面"`);
  const frontmatter = [...fields].map(([key, value]) => value ? `${key}: ${value}` : key).join('\n');
  const next = `---\n${frontmatter}\n---\n${originalBody}`;
  if (!next.endsWith(originalBody)) throw new Error(`${slug} 正文发生变化`);
  fs.writeFileSync(file, next, 'utf8');
}

const files = fs.readdirSync(root).filter((file) => file.endsWith('.md'));
if (files.length !== Object.keys(summaries).length) throw new Error(`文章数量不一致：${files.length}`);
console.log(`已更新 ${files.length} 篇文章的摘要与封面字段，正文保持不变。`);
