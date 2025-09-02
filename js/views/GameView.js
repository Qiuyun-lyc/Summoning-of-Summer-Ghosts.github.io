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
                    <button id="ingame-menu-btn" class="ingame-menu-button">
                        <img src="./assets/img/button.png">
                        <span>菜单</span>
                    </button>
                </div>
            </div>
        `;
        // 为此视图初始化打字机
        engine.uiManager.sentencePrinter = new SentencePrinter(document.getElementById('dialogue-text'));
    },
    attachEventListeners: (container, engine) => {
        const gameView = container.querySelector('.game-view');
        
        // 主点击/触摸处理器
        gameView.addEventListener('click', () => engine.handlePlayerInput());
        
        // 选项按钮
        container.querySelectorAll('.choice-line').forEach(button => {
            button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));
            button.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止事件冒泡到game-view
                engine.audioManager.playSoundEffect('click');
                const choiceIndex = parseInt(e.currentTarget.dataset.choiceIndex);
                engine.handlePlayerInput(choiceIndex);
            });
        });

        // 游戏内菜单按钮
        document.getElementById('ingame-menu-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.audioManager.playSoundEffect('click');
            engine.pauseGame(); // 调用暂停（即打开菜单）
        });
        // 空格键快捷键
        document.addEventListener('keydown', function onKeydown(e) {
            if (e.key === ' ' && document.querySelector('.game-view')) {
              engine.handlePlayerInput();
            }
            // 当视图改变时，需移除这个监听器，避免在其他页面触发（下次一定）
        });
    }
};
export default GameView;