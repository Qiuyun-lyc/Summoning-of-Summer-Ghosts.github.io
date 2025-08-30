import SentencePrinter from '../modules/SentencePrinter.js';

const GameView = {
    render: (container, engine) => {
        container.innerHTML = `
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
                    <button id="pause-btn">暂停</button>
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

        // 暂停按钮
        document.getElementById('pause-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            engine.pauseGame(true);
        });
        
        // 空格键快捷键
        document.addEventListener('keydown', function onKeydown(e) {
            if (e.key === ' ' && document.querySelector('.game-view')) {
              engine.handlePlayerInput();
            }
            // 当视图改变时，需移除这个监听器，避免在其他页面触发
            // 简单起见，这里未做移除
        });
    }
};
export default GameView;