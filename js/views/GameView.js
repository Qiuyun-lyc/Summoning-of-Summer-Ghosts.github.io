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
                    left: 20px;
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
               /* 特殊图片的微弱脉动与黄光效果 */
                .special-image {
                    transition: transform 0.2s ease;
                    --pulse-duration: 6s;
                    --pulse-min: 0.82;
                    --pulse-max: 1.0;
                    --glow-color: rgba(255,220,120,0.55);
                    --glow-size: 14px;
                    animation: pulseOpacity var(--pulse-duration) ease-in-out infinite, glowDrop var(--pulse-duration) ease-in-out infinite;
                    will-change: opacity, filter;
                    filter: drop-shadow(0 0 calc(var(--glow-size) / 3) var(--glow-color));
                    --hover-scale: 1.06;
                    --hover-glow-intensity: 0.32;
                    transition: transform 250ms cubic-bezier(.2,.8,.2,1), box-shadow 250ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease;
                }

                @keyframes pulseOpacity {
                    0% { opacity: var(--pulse-max); }
                    50% { opacity: var(--pulse-min); }
                    100% { opacity: var(--pulse-max); }
                }

                @keyframes glowDrop {
                    0% {
                        filter: drop-shadow(0 0 calc(var(--glow-size) / 3) rgba(255,220,120,0.35)) drop-shadow(0 0 calc(var(--glow-size) / 1.6) rgba(255,220,120,0.18));
                    }
                    40% {
                        filter: drop-shadow(0 0 calc(var(--glow-size) / 1.1) rgba(255,230,140,0.9)) drop-shadow(0 0 calc(var(--glow-size) * 1.4) rgba(255,230,140,0.55));
                    }
                    100% {
                        filter: drop-shadow(0 0 calc(var(--glow-size) / 3) rgba(255,220,120,0.35)) drop-shadow(0 0 calc(var(--glow-size) / 1.6) rgba(255,220,120,0.18));
                    }
                }

                .special-image:hover {
                    transform: scale(var(--hover-scale));
                    filter: drop-shadow(0 0 calc(var(--glow-size) / 0.9) rgba(255,230,140,0.95)) drop-shadow(0 0 calc(var(--glow-size) * 1.8) rgba(255,230,140,0.6));
                }

                .special-image:active {
                    transform: scale(calc(var(--hover-scale) - 0.06));
                }

                @media (prefers-reduced-motion: reduce) {
                    .special-image { animation: none !important; transition: none !important; }
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

                .game-hud-top-right {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 200;
                    display: flex;
                    gap: 10px;
                }
                .ingame-menu-button {
                    position: relative;
                    width: 200px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                .ingame-menu-button img {
                    width: 100%;
                    display: block;
                    transition: transform 0.2s ease, filter 0.2s ease;
                }
                .ingame-menu-button:hover img {
                    transform: scale(1.05);
                    filter: brightness(1.2);
                }
                .ingame-menu-button span {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;
                    font-size: 28px;
                    color: white;
                    text-shadow: 1px 1px 3px #000;
                    pointer-events: none;
                }
                .game-hud-bottom-right {
                    position: absolute;
                    bottom: 12px;
                    right: 30px;
                    display: flex;
                    gap: 25px;
                    z-index: 5;
                }
                .hud-button {
                    background: none;
                    border: none;
                    color: rgba(255, 255, 255, 0.85);
                    font-family: 'FangSong', '仿宋', sans-serif;
                    font-size: 1.2em;
                    cursor: pointer;
                    padding: 5px;
                    transition: color 0.2s, text-shadow 0.2s;
                    text-shadow: 1px 1px 3px rgba(0,0,0,0.8);
                }
                .hud-button:hover {
                    color: #fff;
                    text-shadow: 0 0 6px rgba(255, 255, 255, 0.7);
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
                    <!-- 底部HUD -->
                    <div class="game-hud-bottom-right">
                        <button id="save-load-btn" class="hud-button">存档</button>
                        <button id="fullscreen-btn" class="hud-button">一键全屏</button>
                        <button id="title-btn" class="hud-button">返回</button>
                        <button id="settings-btn" class="hud-button">设置</button>
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
                
                <!-- 右上角HUD -->
                <div class="game-hud-top-right">
                    <button id="history-btn" class="ingame-menu-button">
                        <img src="./assets/img/button.png">
                        <span>对话录</span>
                    </button>
                    <button id="auto-play-btn" class="ingame-menu-button">
                        <img src="./assets/img/button.png">
                        <span>自动</span>
                    </button>
                </div>

                <div id="special-image-container" style="position: fixed; top: 18px; left: 18px; z-index: 120;">
                    <img id="special-click-img" class="special-image" src="./assets/img/1.png" data-seq="30483" alt="special" style="width:220px; height:123px; cursor:pointer; --pulse-duration:3s; --pulse-min:0.7; --glow-color: rgba(255,230,140,0.9); --glow-size: 24px; --hover-scale:1.08; --hover-glow-intensity:0.5; display:block;">
                </div>

                <!-- 历史记录浮层 -->
                <div id="dialogue-history-overlay" class="history-overlay">
                    <div class="history-panel">
                        <h2>对话历史</h2>
                        <div id="history-content">
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
        engine.uiManager.updateAutoPlayButton(engine.gameState.isAutoPlay);

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

        // 对话录按钮 (右上角)
        document.getElementById('history-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.uiManager.toggleHistory(true); // 调用 UIManager 的方法来显示历史
        });
        document.getElementById('history-btn').addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));


        // 关闭历史记录按钮
        document.getElementById('history-close-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.uiManager.toggleHistory(false); // 调用 UIManager 的方法来隐藏历史
        });

        // 自动播放按钮 (右上角)
        document.getElementById('auto-play-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.toggleAutoPlay();
            e.currentTarget.blur();
        });
        document.getElementById('auto-play-btn').addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));

        // 存档/读取按钮 (右下角)
        document.getElementById('save-load-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.showView('Load');
        });

        // 全屏按钮 (右下角)
        document.getElementById('fullscreen-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    alert(`错误: 无法进入全屏模式: ${err.message}`);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });

        // 标题按钮 (右下角)
        document.getElementById('title-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.showView('MainMenu');
        });
        
        // 设置按钮 (右下角)
        document.getElementById('settings-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.showView('Settings');
        });

        // 为所有底部HUD按钮添加悬停音效
        container.querySelectorAll('.hud-button').forEach(button => {
            button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));
        });

        // 特殊图片点击绑定：当 data-seq 为 30483 时跳转到节点 50000
        const specialImg = document.getElementById('special-click-img');
        if (specialImg) {
            specialImg.addEventListener('click', (e) => {
                e.stopPropagation();
                engine.audioManager.playSoundEffect('click');
                const seq = specialImg.getAttribute('data-seq');
                if (seq === '30483') {
                        // 点击时不再隐藏图片，保持在这几个节点中持续显示
                        // 在对话历史中加入记录
                        try {
                            if (engine.gameState.currentSave) {
                                if (!engine.gameState.currentSave.dialogueHistory) engine.gameState.currentSave.dialogueHistory = [];
                                engine.gameState.currentSave.dialogueHistory.push({ type: 'choice', text: '（恭喜你解锁作者设计的隐藏剧情！）' });
                                // 尝试持久化保存（若有 saveManager）
                                if (engine.saveManager && typeof engine.saveManager.save === 'function') {
                                    try { engine.saveManager.save(); } catch (e) { /* ignore save errors */ }
                                }
                            }
                        } catch (hx) { console.warn('添加历史记录时出错', hx); }

                        engine.goToNode(50000).catch(err => console.error('goToNode error:', err));
                }
            });
        }
        // 空格键快捷键
        document.addEventListener('keydown', function onKeydown(e) {
            if (e.key === ' ' && document.querySelector('.game-view')) {
                e.preventDefault();
                engine.requestPlayerInput();
            }
            // 当视图改变时，需移除这个监听器，避免在其他页面触发（下次一定）
        },{passive: false});
    }
};
export default GameView;