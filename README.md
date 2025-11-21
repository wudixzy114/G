# 项目名称

一个基于AI的开放世界文字剧情游戏

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