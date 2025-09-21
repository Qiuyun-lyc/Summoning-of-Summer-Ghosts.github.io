const MainMenuView = {
    render: (container, engine) => {
        const L = engine.localization;
        const bgImages = ['./assets/img/bgr/mainmenu.png'];
        const randomIndex = Math.floor(Math.random() * bgImages.length);

        container.innerHTML = `
            <style>
                :root {
                    --title-font-size: clamp(24px, 4vw, 48px);
                    --subtitle-font-size: clamp(20px, 2.5vw, 36px);
                }

                .view.main-menu-view {
                    width: 100vw;
                    height: 100vh;
                    position: relative;
                    overflow: hidden;
                }

                .bg {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-size: cover;
                    background-position: center;
                    z-index: -1;
                }

                .menu-container {
                    position: absolute;
                    top: 4%;
                    right: 50px;
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                }

                .header {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end; /* 主标题靠右 */
                    margin-bottom: 65vh; /* 按钮整体下移 */
                    width: 100%;
                }

                .header-title {
                    font-size: var(--title-font-size);
                    color: #fff;
                    display: block;
                }

                .header-subtitle {
                    font-size: calc(var(--title-font-size) * 1.1); /* 放大 */
                    color: #fff;
                    display: block;
                    margin-top: 0.1em; /* 紧贴主标题 */
                    opacity: 0.8;
                    width: 100%;
                    text-align: center;
                    align-self: flex-end; /* 在右侧容器内靠右 */
                    margin-right: -2.6em; /* 向右微调，可根据需求修改 */
                }

                .main-menu-button-group {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-end;
                    gap: 12px;
                }

                .main-menu-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    cursor: pointer;
                }

                .main-menu-button img.button-img {
                    width: clamp(15em, 18vw, 22em);
                    height: auto;
                }

                .main-menu-button a {
                    position: absolute;
                    white-space: nowrap;
                    text-align: center;
                    font-size: calc(var(--title-font-size) * 0.85);
                    color: #fff;
                    pointer-events: none;
                }

                .main-menu-button:hover img.button-img {
                    transform: scale(1.05);
                    transition: transform 0.2s ease-in-out;
                }
            </style>

            <div class="view main-menu-view">
                <div class="bg" style="background-image: url('${bgImages[randomIndex]}');"></div>

                <div class="menu-container">
                    <div class="header fade-in">
                        <a class="header-title">夏日幻魂</a>
                        <a class="header-subtitle">ゆうれいのしょうかん</a>
                    </div>

                    <div class="main-menu-button-group">
                        <div class="main-menu-button" data-action="start">
                            <img class="button-img" src="./assets/img/button.png">
                            <a>${L.get('ui.start')}</a>
                        </div>
                        <div class="main-menu-button" data-action="load">
                            <img class="button-img" src="./assets/img/button.png">
                            <a>${L.get('ui.load')}</a>
                        </div>
                        <div class="main-menu-button" data-action="achievement">
                            <img class="button-img" src="./assets/img/button.png">
                            <a>${L.get('ui.achievement')}</a>
                        </div>
                        <div class="main-menu-button" data-action="settings">
                            <img class="button-img" src="./assets/img/button.png">
                            <a>设置</a>
                        </div>
                        <div class="main-menu-button" data-action="about">
                            <img class="button-img" src="./assets/img/button.png">
                            <a>${L.get('ui.about')}</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const bgmMap = {
            './assets/img/bgr/mainmenu.png': './assets/bgm/test.mp3',
        };
        engine.audioManager.playBgm(bgmMap[bgImages[randomIndex]], true);
    },

    attachEventListeners: (container, engine) => {
        const buttons = container.querySelectorAll('.main-menu-button');
        buttons.forEach(button => {
            button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('titleHover'));
            button.addEventListener('click', async (e) => {
                engine.audioManager.playSoundEffect('titleClick');
                const action = e.currentTarget.dataset.action;

                await engine.animation.fadeOutBlack();

                switch (action) {
                    case 'start':
                        engine.startNewGame();
                        break;
                    case 'load':
                        engine.showView('Load');
                        break;
                    case 'settings':
                        engine.showView('Settings');
                        break;
                    case 'achievement':
                        engine.showView('Achievement');
                        break;
                    case 'about':
                        engine.showView('About');
                        break;
                }
            });
        });
    }
};

export default MainMenuView;
