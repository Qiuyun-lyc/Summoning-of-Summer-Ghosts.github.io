
// 导入平台游戏的核心类
import { Game as PlatformerGame } from '../../minigames/platformer/js/core/Game.js';

const MinigameView = {
    // 保存小游戏实例，以便清理
    gameInstance: null,

    render: (container, engine, params) => {
        // params 包含了从 GameEngine 传来的 nodeData
        const node = params.nodeData;
        
        container.innerHTML = `
            <style>
                /* 从 platformer/style.css 移入的关键样式 */
                .minigame-canvas {
                    display: block;
                    width: 100vw;
                    height: 100vh;
                }
            </style>
            <div class="view minigame-view">
                <canvas id="minigame-canvas" class="minigame-canvas"></canvas>
                <div id="minigame-loading-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: #000; color: #fff; display: flex; justify-content: center; align-items: center; font-size: 2em; z-index: 1000;">
                    正在加载小游戏...
                </div>
            </div>
        `;
    },

    attachEventListeners: async (container, engine, params) => {
        const node = params.nodeData;
        const canvas = document.getElementById('minigame-canvas');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onGameComplete = async (result) => {
            console.log("MinigameView 收到完成回调:", result);

            // 1. 播放淡入黑屏动画
            await engine.animation.play('fadeInBlack');

            // 2. 清理小游戏资源
            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.stop();
                MinigameView.gameInstance = null;
            }
            // 此时 container.innerHTML = '' 不是必须的了，因为 showView 会自动清理
            
            const nextNodeId = node.onComplete[result.status];
            if (nextNodeId) {
                // *** 核心修正 ***
                // 3. 重新渲染 GameView 的基础结构（提供“画布”）
                //    注意：此时屏幕是黑的，用户看不到这个中间状态。
                engine.showView('Game');

                // 4. 在新的 GameView 结构上处理并渲染下一个剧情节点
                await engine.processNode(nextNodeId);

                // 5. 播放淡出动画，展示新的剧情场景
                await engine.animation.play('fadeOutBlack');
            } else {
                console.error("未找到对应的小游戏结果节点:", result.status);
                engine.showView('MainMenu');
                await engine.animation.play('fadeOutBlack');
            }
        };

        const gameConfig = {
            level: node.level,
            winCondition: node.winCondition,
            loseCondition: node.loseCondition,
            timeLimit: node.timeLimit
        };

        MinigameView.gameInstance = new PlatformerGame(canvas, gameConfig, onGameComplete);
        
        try {
            await MinigameView.gameInstance.start();
            const loadingOverlay = document.getElementById('minigame-loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = 'none';
            }
        } catch (err) {
            console.error("小游戏启动失败:", err);
            onGameComplete({ status: 'lose' });
        }
    }
};

export default MinigameView;