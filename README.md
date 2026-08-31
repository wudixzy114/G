# G (my-rpg-game)

> **基于 Vue 3 + Phaser + ECS 架构的 Web RPG 框架，把游戏逻辑放进 Web Worker，UI 只负责渲染快照。**

## 项目定位 / 背景

`G` 是一个**面向浏览器**的 RPG 引擎原型，目标是把"游戏循环"与"前端界面"完全解耦：所有 entity/component/system 跑在 `Web Worker` 里，主线程只通过 `postMessage` 拿到 `IWorldSnapshot` 后渲染。这样做的好处是游戏逻辑不被 DOM 抖动影响，也为未来接"AI 生成剧情"或"无头 replay"留下干净的 hook。

当前实现是一个最小可跑版本：内置一个 `World`（管理 entities、systems、tick）、两个 system（`NarrativeSystem` 推进剧情、`ActionSystem` 处理玩家动作）、一个 `Worker` 后台 30 TPS（每秒 tick）循环，以及一个 `Pinia` store 用来桥接 main ↔ worker。UI 层用 `Vue 3` 的 `<GameView>` + `<GameDebug>` 展示世界快照。

设计上把**状态持久化**与**渲染**也拆开了：worker 通过 `dexie` + `rxdb`（两条候选路径，看哪条更顺）落地 entities，下次启动时 `World.init()` 会把数据恢复回来。

## 仓库结构

```
G/
├── docs/api/                 # TypeDoc 生成的 API 文档（已构建）
│   ├── classes/              # Component / Entity / System / World
│   ├── interfaces/           # IComponent / IEntity / IWorldSnapshot
│   ├── modules/              # core/db, core/ecs, core/worker, shared/types
│   └── assets/
├── public/                   # vite 静态资源
├── src/
│   ├── main.ts               # 入口：createApp + Pinia
│   ├── App.vue               # 根组件
│   ├── core/
│   │   ├── worker.ts         # Web Worker 主循环（30 TPS）
│   │   ├── ecs/
│   │   │   ├── World.ts      # 容器：entities + systems + tick
│   │   │   ├── Entity.ts     # 实体：tag + components
│   │   │   ├── Component.ts  # 组件基类
│   │   │   ├── System.ts     # 系统基类
│   │   │   ├── ECS.png       # 架构图
│   │   │   └── ECS1122.mmd   # mermaid 源码
│   │   ├── db/
│   │   │   ├── database.ts   # 抽象 DB 入口
│   │   │   ├── repository.ts # EntityRepository：loadAll / saveBatch
│   │   │   └── schema/       # JSON Schema（ajv 校验用）
│   │   └── systems/
│   │       ├── NarrativeSystem.ts
│   │       └── ActionSystem.ts
│   ├── game/
│   │   ├── launch.ts         # 启动逻辑
│   │   └── scenes/           # Phaser 场景（BootScene / MainScene）
│   ├── shared/
│   │   └── types/
│   │       ├── ecs.ts        # IComponent / IEntity / IWorldSnapshot / EntityID
│   │       └── worker.ts     # WorkerMessageType / MainMessageType 协议
│   └── ui/
│       ├── stores/
│       │   └── gameWorker.ts # Pinia store：包装 Worker
│       ├── views/
│       │   ├── GameView.vue
│       │   └── GameDebug.vue
│       └── components/
│           ├── GameCanvas.vue
│           └── narrative/
├── index.html
├── uno.config.ts             # UnoCSS 配置
├── vite.config.ts
├── tsconfig.doc.json         # TypeDoc 用
├── tsconfig.app.json
├── tsconfig.node.json
├── typedoc.json
└── package.json
```

## 技术栈

| 类别 | 选型 | 版本 |
| --- | --- | --- |
| 前端框架 | Vue | 3.5.24 |
| 状态管理 | Pinia | 3.0.4 |
| 路由 | — | 暂未接入（单视图） |
| 样式原子化 | UnoCSS | 66.5.7 |
| 渲染 | Phaser | 3.90.0 |
| 数据库 | Dexie / RxDB | 4.2.1 / 16.20.0 |
| 校验 | Ajv | 8.17.1 |
| 异步原语 | RxJS | 7.8.2 |
| 工具 | uuid | 13.0.0 |
| 构建 | Vite | 7.2.4 |
| TS | TypeScript | 5.9.3 |
| 文档 | TypeDoc + typedoc-plugin-vue | 0.28.14 / 1.5.1 |
| Node 类型 | @types/node | 24.10.1 |
| 包管理 | pnpm | （含 pnpm-workspace.yaml） |

## 核心模块 / 特性

- **`World` 容器**（`src/core/ecs/World.ts`）：维护 `Map<EntityID, Entity>` 和 `System[]`，提供 `addSystem / createEntity / removeEntity / update / getSnapshot / pushInput / consumeInputs / init / save`。snapshot 结构是 `{ tick, entities, globalState }`，主线程只拿这一份数据去渲染。
- **`Entity` 实体**（`src/core/ecs/Entity.ts`）：通过 `addTag` / `addComponent` 累积状态，`toJSON` / `fromJSON` 用于持久化。
- **System 抽象**（`src/core/systems/`）：当前两个 system——`NarrativeSystem` 推进叙事（看 room description / 给出 choices）、`ActionSystem` 处理玩家操作。新增 system 只要 `world.addSystem(MySystem)`。
- **Web Worker 主循环**（`src/core/worker.ts`）：固定 30 TPS，用 `setInterval` 触发，每轮跑完 `world.update` + `getSnapshot` 后 `postMessage` 给主线程。`onmessage` 处理 `INIT / START / STOP / SAVE / PLAYER_INPUT` 五种命令，错误回 `MainMessageType.ERROR`。
- **Pinia 桥接 store**（`src/ui/stores/gameWorker.ts`）：`shallowRef` 持有 `Worker` 实例；`initWorker / startGame / stopGame / saveGame / sendPlayerInput` 是外部 API；`latestSnapshot` 是 reactive 状态。
- **数据持久化**：`EntityRepository.loadAll / saveBatch` 走 IndexedDB（Dexie wrapper），支持 session restore。
- **场景层**：`src/game/scenes/` 下有 `BootScene` 和 `MainScene`（Phaser scene），但当前 Phaser 实际只作为预留位，没有与 ECS 深度联动。

## 已完成 / 进行中

- ✅ World / Entity / Component / System 骨架
- ✅ Web Worker 后台循环 + 消息协议
- ✅ Pinia store 桥接 main ↔ worker
- ✅ Entity JSON 持久化（restore / save）
- ✅ UnoCSS 接入与 Vue 3 单页应用
- ✅ TypeDoc API 文档已构建在 `docs/api/`
- ⏳ Phaser scene 与 ECS 状态真正联动（目前 BootScene 是占位）
- ⏳ AI 接入：让 NarrativeSystem 接 LLM 生成剧情
- ⏳ action 落地：玩家点击 choice → `pushInput` → system 真的改变 world state
- ❌ 单元测试 / 端到端测试

## 本地开发

```bash
# 一次性安装
pnpm install

# 启动 Vite dev server
pnpm dev

# 类型检查 + 生产构建
pnpm build

# 仅预览构建产物
pnpm preview

# 重新生成 API 文档（TypeDoc）
pnpm docs:api
```

## 状态

v0.0.0，骨架已搭好，能跑空 World 和 30 TPS 循环，但**游戏玩法层尚未接入**——玩家点击 choice 之后 `Worker` 里只是 `console.log`，没有真的把意图翻译成 component 变化。

## License

仓库内未声明 License；默认按作者私仓处理。
