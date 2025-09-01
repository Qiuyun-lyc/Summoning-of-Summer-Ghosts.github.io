const AboutView = {
    render: (container, engine) => {
        const L = engine.localization;
        
        container.innerHTML = `
        <style>
                .achievement-view {
                    display: flex;
                    flex-direction: column;
                }

                /* 顶部导航栏 */
                .navbar {
                    height: 100px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    position: relative;
                    z-index: 10;
                }

                /* 通用按钮样式 */
                .menu-button {
                    position: relative;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'lilyshow','FangSong','仿宋','SimSun',sans-serif;
                    padding: 0;
                }

                .menu-button img {
                    display: block;
                }

                .menu-button span {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: clamp(20px, 2vw, 40px);
                    color: #fff;
                    white-space: nowrap;
                    pointer-events: none;
                }

                /* 成就网格 */
                .achievement-grid-container {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                    padding: 20px 40px;   /* 左右留边距 */
                    margin-top: 20px;     /* 导航栏下方留出空间 */
                }
            </style>
            <div class="view about-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                 <nav class="navbar" id="achievement-navbar">
                    <!-- 我的成就 -->
                    <button class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('关于')}</span>
                    </button>

                    <!-- 返回主菜单 -->
                    <button id="back-to-menu" class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.title')}</span>
                    </button>
                </nav>

                <div class="about-content">
                    <div class="about-content-wrapper">
                        <!-- 第一排 2 个，居中 -->
                        <div class="gallery row1">
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/1.jpg" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/1.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/2.png" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/2.png" alt="反面图" />
                                </div>
                            </div>
                        </div>

                        <!-- 第二排 3 个，均分 -->
                        <div class="gallery row2">
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/3.jpg" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/3.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/4.jpg" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/4.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/5.jpg" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/5.jpg" alt="反面图" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    attachEventListeners: (container, engine) => {
        document.getElementById('back-to-menu').addEventListener('click', () => {
            engine.audioManager.playSoundEffect('click');
            engine.showView('MainMenu');
        });
    }
};

export default AboutView;