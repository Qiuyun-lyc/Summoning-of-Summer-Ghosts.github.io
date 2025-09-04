import { AssetManager } from './AssetManager.js';
import { InputHandler } from './InputHandler.js';
import { RendererSystem } from '../systems/RendererSystem.js';
import { GameStateManager } from '../states/GameStateManager.js';
import { TitleState } from '../states/TitleState.js';
import { PlayState } from '../states/PlayState.js';
import { achievementManager } from '../services/AchievementManager.js';
// 引入事件总线，用于监听玩家死亡事件
import { gameEvents } from './EventBus.js';
import { Transform } from '../components/Transform.js';


//整个游戏的引擎核心和总控制器
export class Game {
    // 构造函数现在接收 canvas 元素、配置对象和完成回调
    constructor(canvas, config, onCompleteCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config; // { level: 'level1.json', winCondition: ... }
        this.onComplete = onCompleteCallback; // 游戏结束时调用的函数

        this.lastTime = 0;
        this.isRunning = false;
        this.inputHandler = new InputHandler();
        // 关键修改：资源路径需要更新
        this.assetManager = new AssetManager('minigames/platformer/'); 
        this.renderer = new RendererSystem(this.canvas);
        this.stateManager = new GameStateManager(this);
        this.achievementManager = achievementManager;

        // 监听玩家死亡事件来触发游戏失败
        gameEvents.on('entityDied', (payload) => {
            if (payload.gameObject.name === 'Player') {
                this._endGame({ status: 'lose' });
            }
        });
        
        this._gameLoop = this._gameLoop.bind(this);
    }

    //异步启动游戏
    async start() {
        //初始化画布大小并随窗口缩放而改变
        this.renderer.handleResize();
        // 注意：我们不再添加全局的resize监听器，因为它会与VN引擎冲突。
        // 父视图(MinigameView)将负责管理画布大小。

        //加载资源
        await this.assetManager.loadAll();

        //向状态管理器中添加游戏状态
        // 我们不再需要TitleState，直接进入PlayState
        // this.stateManager.addState('TITLE', new TitleState()); 
        this.stateManager.addState('PLAY', new PlayState());
        
        this.isRunning = true;
        this.lastTime = performance.now();
        
        // 直接根据配置进入游戏状态
        this.stateManager.setState('PLAY', { level: this.config.level });
        
        requestAnimationFrame(this._gameLoop);
    }
    
    // 新增：停止游戏循环的方法
    stop() {
        this.isRunning = false;
        // 清理事件监听器，防止内存泄漏
        this.inputHandler.destroy();
        gameEvents.off('entityDied'); // 取消监听
    }

    // 新增：内部方法，用于结束游戏并调用回调
    _endGame(result) {
        if (!this.isRunning) return; // 防止重复调用
        this.stop();
        console.log(`小游戏结束，结果:`, result);
        if (this.onComplete) {
            this.onComplete(result);
        }
    }

    //游戏主循环
    _gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = (timestamp - this.lastTime);
        this.lastTime = timestamp;

        this.update(deltaTime, this.inputHandler);
        this.draw();
        
        this.inputHandler.consumeActionKeys();
        
        requestAnimationFrame(this._gameLoop);
    }

    //更新游戏状态
    update(deltaTime, input) {
        this.stateManager.update(deltaTime, input);

        // 在这里检查胜利条件
        if (this.config.winCondition && this.config.winCondition.type === 'reach_x') {
            const player = this.stateManager.currentState.scene?.player;
            if (player) {
                const playerTransform = player.getComponent(Transform);
                if (playerTransform.x >= this.config.winCondition.value) {
                    this._endGame({ status: 'win' });
                }
            }
        }
    }

    //绘制游戏画面
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stateManager.draw();
    }

}
