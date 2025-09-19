import SentencePrinter from '../modules/SentencePrinter.js';

const GameView = {
    render: (container, engine) => {
        container.innerHTML = `
            <style>
                /* 选项组容器样式 */
                .choice-group {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 15px; /* 选项之间的垂直间距 */
                    z-index: 100;
                    width: 80%;
                    max-width: 700px;
                }

                /* 单个选项行样式 */
                .choice-line {
                    position: relative; /* 作为内部绝对定位元素的锚点 */
                    width: 100%;
                    min-height: 70px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                /* 按钮背景图和悬停图的通用样式 */
                .choice-line .button-icon,
                .choice-line .button-icon-hover {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    transition: opacity 0.3s ease-in-out; /* 添加平滑过渡效果 */
                }

                /* 默认隐藏悬停状态的图片 */
                .choice-line .button-icon-hover {
                    opacity: 0;
                }

                /* 当鼠标悬停在 .choice-line 上时，显示悬停图片 */
                .choice-line:hover .button-icon-hover {
                    opacity: 1;
                }

                /* 选项文字样式 */
                .choice-line .choice-text {
                    position: relative; /* 确保文字在图片上层 */
                    z-index: 2;
                    font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;
                    font-size: clamp(18px, 2.2vw, 24px); /* 响应式字体大小 */
                    color: white;
                    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8); /* 文字阴影，增强可读性 */
                    padding: 0 20px;
                    text-align: center;
                    pointer-events: none; /* 让鼠标事件穿透文字，触发父元素的悬停 */
                }

                /* 历史记录浮层样式 */
                .history-overlay {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100vw; height: 100vh;
                    background-color: rgba(0, 0, 0, 0.8);
                    z-index: 1000;
                    display: none; /* 默认隐藏 */
                    justify-content: center;
                    align-items: center;
                    backdrop-filter: blur(5px);
                    -webkit-backdrop-filter: blur(5px);
                }
                .history-panel {
                    width: 90%;
                    max-width: 800px;
                    height: 80%;
                    background-color: rgba(20, 20, 30, 0.9);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    padding: 20px 30px;
                    box-shadow: 0 0 25px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                }
                .history-panel h2 {
                    text-align: center;
                    color: white;
                    margin-top: 0;
                    margin-bottom: 20px;
                    font-family: 'lilyshow', sans-serif;
                    font-size: 2em;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                    padding-bottom: 15px;
                }
                #history-content {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding-right: 15px; /* 为滚动条留出空间 */
                }
                .history-entry {
                    margin-bottom: 18px;
                    color: white;
                }
                .history-speaker {
                    font-weight: bold;
                    font-size: 1.2em;
                    color: #e1abd2ff; /* 粉色，用于突出说话人 */
                    margin-bottom: 8px;
                    font-family: 'lilyshow', sans-serif;
                }
                .history-text {
                    font-size: 1.1em;
                    line-height: 1.6;
                    white-space: pre-wrap; /* 保留换行 */
                    color: #f0f0f0;
                }
                
                .history-choice {
                    padding: 12px 20px;
                    margin: 15px 0;
                    text-align: center;
                    background-color: rgba(128, 128, 128, 0.2);
                    border-left: 4px solid #87CEEB; /* 天蓝色边框以示区分 */
                    border-radius: 8px;
                    font-style: italic;
                    color: #E0FFFF; /* 淡青色文字 */
                }

                #history-close-btn {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    font-size: 2em;
                    color: white;
                    cursor: pointer;
                    background: none;
                    border: none;
                }
                /* 美化滚动条 */
                #history-content::-webkit-scrollbar { width: 8px; }
                #history-content::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 4px;}
                #history-content::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.4); border-radius: 4px;}
                #history-content::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.6); }

                .tooltip-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 998;
                }
                .tooltip {
                    background-color: rgba(0, 0, 0, 0.8); 
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    font-size: 16px;
                    opacity: 0;
                    transition: opacity 0.5s ease-in-out;
                    pointer-events: none;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
                }
                .tooltip.visible {
                    opacity: 1;
                }
                .tooltip.hidden {
                    display: none;
                }
                .tooltip kbd {
                    display: inline-block;
                    padding: 2px 6px;
                    font-family: monospace;
                    background-color: #333;
                    border: 1px solid #555;
                    border-radius: 3px;
                    margin: 0 4px;
                }
                .ingame-menu-button.active img {
                    filter: brightness(1.3) drop-shadow(0 0 5px #ffabf5); 
                }
                #basic-tooltip.hidden {
                    display: none;
                }
            </style>
            <div class="view game-view">
                <img class="game-bgr" id="game-bgr">
                
                <div class="char-box l-char-box" id="l-char-box"><img id="l-char"></div>
                <div class="char-box r-char-box" id="r-char-box"><img id="r-char"></div>

                <div class="dialogue-group" style="display: none;">
                    <img src="./assets/img/menuBox/text_frame00.png">
                    <div class="textbox-content">
                        <div id="dialogue-name" class="textbox-name"></div>
                        <div id="dialogue-text" class="textbox-text"></div>
                    </div>
                </div>

                <div class="choice-group" style="display: none;">
                    <div class="choice-line" data-choice-index="0">
                        <img class="button-icon" src="./assets/img/menuBox/menu_frame0.png">
                        <div class="choice-text"></div>
                        <img class="button-icon-hover" src="./assets/img/menuBox/menu_frame_hover.png">
                    </div>
                    <div class="choice-line" data-choice-index="1">
                         <img class="button-icon" src="./assets/img/menuBox/menu_frame0.png">
                        <div class="choice-text"></div>
                        <img class="button-icon-hover" src="./assets/img/menuBox/menu_frame_hover.png">
                    </div>
                    <div class="choice-line" data-choice-index="2">
                         <img class="button-icon" src="./assets/img/menuBox/menu_frame0.png">
                        <div class="choice-text"></div>
                        <img class="button-icon-hover" src="./assets/img/menuBox/menu_frame_hover.png">
                    </div>
                </div>
                
                <div class="game-hud">
                    <button id="history-btn" class="ingame-menu-button">
                        <img src="./assets/img/button.png">
                        <span>对话录</span>
                    </button>
                    <button id="auto-play-btn" class="ingame-menu-button">
                        <img src="./assets/img/button.png">
                        <span>自动</span>
                    </button>
                    <button id="ingame-menu-btn" class="ingame-menu-button">
                        <img src="./assets/img/button.png">
                        <span>菜单</span>
                    </button>
                </div>

                <!-- 历史记录浮层 -->
                <div id="dialogue-history-overlay" class="history-overlay">
                    <div class="history-panel">
                        <h2>对话历史</h2>
                        <div id="history-content">
                            <!-- 历史记录将动态插入这里 -->
                        </div>
                    </div>
                    <button id="history-close-btn">&times;</button>
                </div>
                <div class="tooltip-container">
                    <div id="game-tooltip" class="tooltip"></div>
                </div>
            </div>
        `;
        // 为此视图初始化打字机
        engine.uiManager.sentencePrinter = new SentencePrinter(document.getElementById('dialogue-text'));
    },
    attachEventListeners: (container, engine) => {
        const gameView = container.querySelector('.game-view');
        
        // 主点击/触摸处理器
        gameView.addEventListener('click', () => engine.requestPlayerInput());
        
        // 选项按钮
        container.querySelectorAll('.choice-line').forEach(button => {
            button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡到game-view
                engine.audioManager.playSoundEffect('click');
                const choiceIndex = parseInt(e.currentTarget.dataset.choiceIndex);
                engine.requestPlayerInput(choiceIndex);
            });
        });

        // 游戏内菜单按钮
        document.getElementById('ingame-menu-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.pauseGame(); // 调用暂停
        });

        // 历史记录按钮
        document.getElementById('history-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.uiManager.toggleHistory(true); // 调用 UIManager 的方法来显示历史
        });

        // 关闭历史记录按钮
        document.getElementById('history-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.uiManager.toggleHistory(false); // 调用 UIManager 的方法来隐藏历史
        });

        // 自动播放按钮
        document.getElementById('auto-play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.toggleAutoPlay();
        });

        // 空格键快捷键
        document.addEventListener('keydown', function onKeydown(e) {
            if (e.key === ' ' && document.querySelector('.game-view')) {
              engine.requestPlayerInput();
            }
            // 当视图改变时，需移除这个监听器，避免在其他页面触发（下次一定）
        });
    }
};
export default GameView;