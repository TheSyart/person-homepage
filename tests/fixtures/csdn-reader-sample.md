Title: 从零实现自己的agent第五期：子代理实现

URL Source: https://blog.csdn.net/m0_70561094/article/details/161193349

Published Time: 2026-05-18T13:57:08+08:00

Markdown Content:
## [](https://blog.csdn.net/m0_70561094/article/details/161193349)[](https://blog.csdn.net/m0_70561094/article/details/161193349)Subagent 实现：把脏活交给独立上下文

**摘要**：有了任务规划，主 Agent 知道要做什么、做到哪一步。Subagent 把局部探索放进独立上下文，最后只把高密度总结回传主线。

**标签**：Agent、Subagent、上下文隔离、并发、Tool Use

![Image 1: 在这里插入图片描述](https://i-blog.csdnimg.cn/direct/example.png#pic_center)

### [](https://blog.csdn.net/m0_70561094/article/details/161193349)独立 runner 和工具白名单

工具执行时会创建独立 runner：

```
runner = self._runner_factory(spec=spec, sub_registry=sub_registry)
history = [{"role": "user", "content": task}]
final = runner.step(history)
```

python

运行

![Image 2](https://csdnimg.cn/release/blogv2/dist/pc/img/runCode/icon-arrowwhite.png)

*   1
*   2
*   3

这几行代码说明子代理拥有自己的上下文与工具边界。
