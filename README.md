项目结构
.
├── assets/          # 静态资源 (图片, CSS, 音视频)
├── data/            # 游戏内容数据 (剧情, 语言, 成就)
│   ├── lang/
│   └── *.json
├── js/              # 主叙事引擎JavaScript源代码
│   ├── core/        # 核心管理器 (GameEngine, DataManager, etc.)
│   ├── modules/     # 可重用功能模块 (Animation, SentencePrinter, etc.)
│   └── views/       # 视图状态模块 (MainMenuView, GameView, etc.)
├── minigames/       # 嵌入式小游戏
│   └── platformer/  # 平台跳跃游戏 (一个独立的ECS项目)
├── team/            # 团队成员介绍静态页面
├── index.html       # 应用主入口
├── LICENSE.md       # 开源证书
└── README.md        # 本文档

技术架构
  主叙事引擎 (AVG Engine)
    架构: 采用视图驱动的FSM模型。GameEngine.js 作为中央控制器，通过 showView() 方法切换不同的游戏状态。
    数据流: DataManager.js 在启动时异步加载所有 data/*.json 文件。GameEngine 的核心循环 processNode() 负责解析 story.json 中的节点数据，并分发指令给各个模块。
    核心数据结构:
      叙事节点图 (story.json): 一个以节点ID为键的哈希表，逻辑上构成了一个有向图，通过 onNext 属性定义了剧情的流转规则。
      存档对象 (SaveManager.js): 使用 User 和 Save 类定义了清晰的数据模型，用于状态持久化。
  平台跳跃引擎 (Platformer Engine)
    架构: 采用经典的实体组件系统 (ECS, Entity-Component-System) 架构。
    实体 (GameObject.js): 游戏世界万物的容器。
    组件 (/components): 封装了单一功能的数据和逻辑，如 Transform, Physics, Animator, HealthComponent。
    系统 (/systems): 负责处理拥有特定组件的实体，如 RendererSystem。
    物理与游戏循环: 实现了一个基于requestAnimationFrame的固定时间步长游戏循环，并内置了一个使用欧拉积分和基于网格的离散碰撞检测的简易2D物理引擎 (Physics.js)。
    关卡定义: 关卡布局、碰撞区域和实体生成点均由 Tiled Map Editor 导出为 level*.json 文件。

贡献者
Wang Wanqi (王万淇)     - Project Manager
Ge Hongkang (葛洪康)    - Story Director
Wang Guangyuan (王光源) - Technical Director
Chen Yuwei (陈煜玮)     - Video Editor / Tester
Liu Lanxuan (刘澜轩)    - Frontend Developer

许可证
本项目基于 MIT License 进行开源。
