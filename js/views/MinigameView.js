
import { Game as PlatformerGame } from '../../minigames/platformer/js/core/Game.js';

const MinigameView = {
    gameInstance: null,

    render: (container, engine, params) => {
        const node = params.nodeData;
        
        container.innerHTML = `
            <style>
                /* 从 platformer/style.css 移入的关键样式 */
                .minigame-canvas {
                    display: block;
                    width: 100vw;
                    height: 100vh;
                }
                .minigame-intro-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.85);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    z-index: 1001; /* 确保在加载提示之上 */
                    font-family: 'FangSong', '仿宋', sans-serif;
                }
                .intro-content {
                    max-width: 600px;
                    padding: 40px;
                    border: 2px solid #aaa;
                    background-color: rgba(10, 10, 10, 0.7);
                    border-radius: 10px;
                }
                .intro-content h2 {
                    font-size: 2.5em;
                    margin-bottom: 20px;
                    color: #5b6ba9ff;
                }
                .intro-content p {
                    font-size: 1.2em;
                    line-height: 1.6;
                    margin-bottom: 30px;
                }
                .controls-hint {
                    font-size: 1.1em;
                    color: #ccc;
                    margin-bottom: 40px;
                }
                #minigame-start-btn {
                    padding: 15px 40px;
                    font-size: 1.5em;
                    cursor: pointer;
                    background-color: #333;
                    color: white;
                    border: 2px solid white;
                    border-radius: 5px;
                    transition: all 0.3s ease;
                }
                #minigame-start-btn:hover {
                    background-color: white;
                    color: black;
                }
            </style>
            <div class="view minigame-view">
                <div id="minigame-intro-overlay" class="minigame-intro-overlay">
                    <div class="intro-content">
                        <h2>记忆碎片</h2>
                        <p>${node.introText || '收集所有光芒以继续。'}</p>
                        <div class="controls-hint">A / D : 移动  |  W : 跳跃</div>
                        <button id="minigame-start-btn">开始</button>
                    </div>
                </div>
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
        const introOverlay = document.getElementById('minigame-intro-overlay');
        const loadingOverlay = document.getElementById('minigame-loading-overlay');
        const startButton = document.getElementById('minigame-start-btn');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onGameComplete = async (result) => {
            console.log("MinigameView 收到完成回调:", result);

            await engine.animation.play('fadeInBlack');

            if (MinigameView.gameInstance) {
                MinigameView.gameInstance.stop();
                MinigameView.gameInstance = null;
            }
            
            const nextNodeId = node.onComplete[result.status];
            if (nextNodeId) {
                engine.showView('Game');

                await engine.processNode(nextNodeId);

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
        const tempGameInstance = new PlatformerGame(canvas, gameConfig, onGameComplete);
        try {
            await tempGameInstance.assetManager.loadAll();
            loadingOverlay.style.display = 'none';
            introOverlay.style.display = 'flex';
        } catch(err) {
            console.error("小游戏资源加载失败:", err);
            onGameComplete({ status: 'lose' });
            return;
        }

        startButton.addEventListener('click', async () => {
            introOverlay.style.display = 'none';

            MinigameView.gameInstance = new PlatformerGame(canvas, gameConfig, onGameComplete);
            
            try {
                await MinigameView.gameInstance.start();
            } catch (err) {
                console.error("小游戏启动失败:", err);
                onGameComplete({ status: 'lose' });
            }
        });
    }
};

export default MinigameView;