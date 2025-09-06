import { Game as PlatformerGame } from '../../minigames/platformer/js/core/Game.js';

const MinigameView = {
    gameInstance: null,

    render: (container, engine, params) => {
        const node = params.nodeData;
        
        container.innerHTML = `
            <style>
                .minigame-canvas { display: block; width: 100vw; height: 100vh; }
                
                /* 介绍和结果浮层的通用样式 */
                .minigame-overlay {
                    position: fixed; top: 0; left: 0;
                    width: 100%; height: 100%;
                    background-color: rgba(0, 0, 0, 0.85); color: white;
                    display: flex; justify-content: center; align-items: center;
                    text-align: center; z-index: 1001;
                    font-family: 'FangSong', '仿宋', sans-serif;
                }
                .overlay-content {
                    max-width: 600px; padding: 40px;
                    border: 2px solid #aaa; background-color: rgba(10, 10, 10, 0.7);
                    border-radius: 10px;
                }
                .overlay-content h2 { font-size: 2.5em; margin-bottom: 20px; }
                .overlay-content p { font-size: 1.2em; line-height: 1.6; margin-bottom: 30px; }
                .overlay-content .controls-hint { font-size: 1.1em; color: #ccc; margin-bottom: 40px; }
                .overlay-content button {
                    padding: 15px 40px; font-size: 1.5em; cursor: pointer;
                    background-color: #333; color: white; border: 2px solid white;
                    border-radius: 5px; transition: all 0.3s ease;
                }
                .overlay-content button:hover { background-color: white; color: black; }
                
                /* 特定样式 */
                #minigame-intro-overlay .overlay-content h2 { color: #5b6ba9ff; }
                #minigame-result-overlay { display: none; } /* 结果浮层默认隐藏 */
            </style>
            <div class="view minigame-view">
                <!-- 介绍浮层 -->
                <div id="minigame-intro-overlay" class="minigame-overlay">
                    <div class="overlay-content">
                        <h2>记忆碎片</h2>
                        <p>${node.introText || '收集所有光芒以继续。'}</p>
                        <div class="controls-hint">A / D : 移动  |  W : 跳跃</div>
                        <button id="minigame-start-btn">开始</button>
                    </div>
                </div>

                <!-- 结果浮层 -->
                <div id="minigame-result-overlay" class="minigame-overlay">
                    <div class="overlay-content">
                        <h2 id="result-title"></h2>
                        <p id="result-text"></p>
                        <button id="minigame-continue-btn">继续</button>
                    </div>
                </div>

                <canvas id="minigame-canvas" class="minigame-canvas"></canvas>
                <div id="minigame-loading-overlay" style="/* ... */">正在加载小游戏...</div>
            </div>
        `;
    },

    attachEventListeners: async (container, engine, params) => {
        const node = params.nodeData;
        const canvas = document.getElementById('minigame-canvas');
        const introOverlay = document.getElementById('minigame-intro-overlay');
        const loadingOverlay = document.getElementById('minigame-loading-overlay');
        const startButton = document.getElementById('minigame-start-btn');

        const resultOverlay = document.getElementById('minigame-result-overlay');
        const resultTitle = document.getElementById('result-title');
        const resultText = document.getElementById('result-text');
        const continueButton = document.getElementById('minigame-continue-btn');
        
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const onGameComplete = (result) => {
            console.log("MinigameView 收到完成回调:", result);
            
            const resultData = node.onComplete[result.status];
            if (!resultData) {
                console.error("未找到对应的游戏结果数据:", result.status);
                engine.showView('MainMenu');
                return;
            }
            
            resultTitle.textContent = node.resultTitle || '任务结果';
            resultText.textContent = resultData.outroText;
            resultTitle.style.color = result.status === 'win' ? '#5b6ba9ff' : '#bd504fff';
            

            resultOverlay.style.display = 'flex';

            continueButton.addEventListener('click', async () => {
                resultOverlay.style.display = 'none';

                await engine.animation.play('fadeInBlack');

                if (MinigameView.gameInstance) {
                    MinigameView.gameInstance.stop();
                    MinigameView.gameInstance = null;
                }
                
                const nextNodeId = resultData.targetNode;
                engine.showView('Game');
                await engine.processNode(nextNodeId);
                await engine.animation.play('fadeOutBlack');

            }, { once: true });
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