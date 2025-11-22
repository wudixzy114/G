# 🌌 AI 开放世界文字 RPG —— 架构设计指南

本项目是一个高性能、可扩展的 Web 游戏引擎模板。它不只是一个游戏，更是一个**如何将重逻辑应用（Heavy-Logic App）从 UI 中解耦**
的教科书级示例。

---

## 1. 核心设计理念：三层分离

对于初学者来说，理解这个项目的关键在于明白我们把应用切成了三个“平行宇宙”：

| 层级 | 技术栈 | 职责 (Analogy) | 运行位置 |
| :--- | :--- | :--- | :--- |
| **视觉与交互层** | **Vue 3 + Phaser** | **身体与感官**。负责显示画面、接收点击、播放动画。 | 主线程 (Main Thread) |
| **逻辑核心层** | **ECS (Entity-Component-System)** | **大脑**。负责思考、计算伤害、生成剧情、决定下一步。 | Web Worker (独立线程) |
| **数据持久层** | **RxDB (IndexedDB)** | **记忆**。负责长久存储所有状态，即使关机也不会遗忘。 | Worker 线程内部 |

### 为什么要这么做？

1. **性能**：大脑（Worker）在疯狂计算 AI 或寻路时，不会卡住身体（UI），界面永远流畅（60fps）。
2. **解耦**：你想把 Vue 换成 React？或者把 Phaser 换成 Three.js？没问题，因为大脑（逻辑层）完全不知道身体长什么样，它只输出纯数据。
3. **持久化**：数据层独立，意味着游戏可以随时自动保存，甚至实现“时间回溯”。

---

## 2. 数据的生命周期：一次“点击”的旅程

为了让新人理解系统是如何运转的，我们来追踪一个具体的动作：**玩家点击了“观察四周 (Look)”按钮**。

### 第一阶段：指令发送 (The Intent)

1. **用户操作**：玩家在 Vue 界面点击按钮。
2. **Store 响应**：`useGameWorkerStore` 接收到点击事件。
3. **消息传递**：Store 通过 `postMessage` 向 Worker 发送一封信：
   ```json
   { "type": "PLAYER_INPUT", "payload": { "action": "LOOK" } }
   ```
   *此时，Vue 的工作暂时结束，它只是在等待回信。*

### 第二阶段：逻辑处理 (The Brain)

4. **接收信件**：`worker.ts` 收到消息，将其推入 **World** 的输入队列。
5. **ECS 循环 (Tick)**：Worker 的心跳（Game Loop）正在以每秒 30 次的速度跳动。
6. **系统介入**：`ActionSystem` 在这一帧醒来，发现队列里有个 "LOOK" 指令。
    * 它找到“当前房间”实体，读取 `DescriptionComponent`（描述组件）。
    * 它找到“玩家”实体，修改 `NarrativeLogComponent`（日志组件），把房间描述追加进去。
7. **状态变更**：此时，内存中的数据已经变了，但界面还没变。

### 第三阶段：快照同步 (The Snapshot)

8. **生成快照**：帧结束时，World 把当前所有实体打包成一个纯 JSON 对象（Snapshot）。
9. **发送回执**：Worker 把快照通过 `postMessage` 发回给主线程。
10. **后台保存**：Worker 顺便调用 **RxDB**，将变动的实体静默写入浏览器的 IndexedDB 数据库中（自动存档）。

### 第四阶段：渲染呈现 (The Rendering)

11. **Store 更新**：Vue 的 Store 收到快照，更新 `latestSnapshot` 变量。
12. **双重渲染**：
    * **Vue (文字)**：`StoryLog.vue` 监测到日志数组变长了，自动在 DOM 中渲染出一段新文字。
    * **Phaser (画面)**：`MainScene.ts` 的 `update` 循环监测到数据更新，调整 Canvas 上代表玩家或 NPC 的图标位置/状态。

---

## 3. 关键模块详解

### A. ECS 架构 (逻辑层)

不要被名字吓到，它其实是**组合优于继承**的极致体现。

* **Entity (实体)**: 只是一个 ID（比如 "player_001"）。它本身没有属性。
* **Component (组件)**: 纯数据包。
    * `PositionComponent`: `{ x: 10, y: 20 }`
    * `NarrativeComponent`: `{ history: [...] }`
* **System (系统)**: 纯逻辑。
    * `MovementSystem`: 每一帧查找所有有“位置”和“速度”组件的实体，更新 `x = x + v`。
    * `NarrativeSystem`: 处理剧情文本。

**优势**：你可以随时给“石头”添加一个“对话组件”，这块石头就能说话了。不需要修改类的继承关系。

### B. RxDB (数据层)

这是游戏的“海马体”。

* 我们不直接把 ECS 对象存进去，而是通过 `toJSON()` 转换成干净的 JSON。
* Worker 启动时，会先问 RxDB：“我上次记得什么？”，然后通过 `fromJSON()` 重建整个游戏世界。

### C. Vue + Phaser (混合渲染)

这是本架构的亮点。

* **Vue** 擅长处理 UI：复杂的背包列表、技能树、长篇剧情文本、滚动条。用 HTML/CSS 做这些比用 Canvas 画图快10倍且好维护。
* **Phaser** 擅长处理游戏性：粒子效果、物理碰撞、地图漫游、战斗特效。
* **结合点**：Vue 作为容器，Phaser 作为一个组件嵌入其中。两者都只听命于 ECS 的数据。

---

## 4. 目录结构导游

新人拿到代码后，应该先看哪里？

```text
src/
├── core/                # 【大脑】Worker 线程的代码
│   ├── ecs/             # ECS 引擎的基础定义 (World, Entity)
│   ├── systems/         # 具体逻辑 (ActionSystem, NarrativeSystem)
│   ├── db/              # 数据库逻辑
│   └── worker.ts        # 大脑的入口点 (接收消息，启动循环)
│
├── game/                # 【视觉】Phaser 游戏引擎代码
│   ├── scenes/          # 场景 (MainScene 负责把 ECS 数据画出来)
│   └── launch.ts        # 启动器
│
├── ui/                  # 【交互】Vue 3 界面代码
│   ├── components/      # UI 组件 (StoryLog, GameCanvas)
│   └── stores/          # Pinia 状态库 (连接 UI 和 Worker 的桥梁)
│
└── shared/              # 【契约】前后端通用的类型定义
    └── types/           # 这里的修改会同时影响 UI 和 Worker
```

---

## 5. 总结

这个架构教会了我们什么？

1. **关注点分离**：写剧情逻辑的人不需要懂 CSS，写 UI 的人不需要懂数据库优化。
2. **数据驱动 (Data-Driven)**：界面只是数据的投影。只要数据变了，界面就会自动对。
3. **面向未来**：利用 Web Worker 和 IndexedDB，我们突破了浏览器单线程的限制，为构建真正复杂的 Web 游戏打下了地基。

现在，去 `src/core/systems/ActionSystem.ts` 尝试添加一个新的指令（比如 "JUMP"），看看你能否让数据流转整个循环！

## 📁 目录结构

```text
src/
├── assets/              # 静态资源
├── core/                # 核心逻辑 (Worker 环境)
│   ├── ecs/             # ECS 框架核心
│   │   ├── Component.ts # 组件基类
│   │   ├── Entity.ts    # 实体定义
│   │   ├── System.ts    # 系统基类
│   │   └── World.ts     # ECS 世界管理器
│   ├── db/              # RxDB 数据库逻辑
│   │   ├── schema/      # 数据库 Schema 定义
│   │   └── database.ts  # 数据库初始化
│   ├── systems/         # 具体游戏逻辑系统 (如：时间系统, 战斗计算系统)
│   └── worker.ts        # Web Worker 入口 (消息分发中心)
├── game/                # Phaser 游戏引擎相关 (Main Thread)
│   ├── scenes/          # Phaser 场景
│   └── renderer/        # 负责将 ECS 数据渲染为画面
├── shared/              # 前后端通用类型、常量 (Contract)
│   ├── types/           # TypeScript 类型定义
│   └── constants/       # 全局常量
├── ui/                  # Vue 3 组件 (Main Thread)
│   ├── components/      # 通用 UI 组件
│   ├── views/           # 页面级组件
│   ├── stores/          # Pinia 状态管理 (UI 数据源)
│   └── composables/     # Vue Hooks
├── utils/               # 工具函数
├── App.vue
└── main.ts