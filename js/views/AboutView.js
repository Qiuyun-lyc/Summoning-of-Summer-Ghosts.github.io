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
                /* 保持图片/翻转样式由外部样式表控制，仅对容器做最小调整 */
                .about-content {
                    /* 限制高度以便在视窗高度不足时启用垂直滚动（支持鼠标滚轮） */
                    max-height: calc(100vh - 140px);
                    overflow-y: auto;
                    -webkit-overflow-scrolling: touch;
                }
                /* 美化 about-content 的滚动条（仅作用于此容器） */
                .about-content::-webkit-scrollbar { width: 12px; }
                .about-content::-webkit-scrollbar-track { background: rgba(0,0,0,0.12); border-radius: 8px; }
                .about-content::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06)); border-radius: 8px; border: 2px solid rgba(0,0,0,0.06); }
                .about-content::-webkit-scrollbar-thumb:hover { background: linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08)); }
                .about-content::-webkit-scrollbar-corner { background: transparent; }
                /* Firefox 支持 */
                .about-content { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.12) rgba(0,0,0,0.12); }
                .about-content-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center; /* 居中 gallery */
                }
                /* 在更广泛的窄屏或横向无法容纳多图时，强制从上到下单列排列 */
                @media (max-width: 640px) {
                    .gallery.row1, .gallery.row2 { grid-template-columns: 1fr !important; justify-items: center; }
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
                            <div class="icon_img" data-profile="team/wwq.html">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/1.jpg" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/1.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img" data-profile="team/ghk.html">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/2.png" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/2.png" alt="反面图" />
                                </div>
                            </div>
                        </div>

                        <!-- 第二排 3 个，均分 -->
                        <div class="gallery row2">
                            <div class="icon_img" data-profile="team/wgy.html">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/3.jpg" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/3.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img" data-profile="team/cyw.html">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./assets/img/teammate/4.jpg" alt="正面图" />
                                    <img class="fanImg" src="./assets/img/teammate/4.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img" data-profile="team/llx.html">
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

        container.querySelectorAll('.icon_img[data-profile]').forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                engine.audioManager.playSoundEffect('click');
                if (engine.saveManager.currentUser) {
                    localStorage.setItem('activeSessionUser', engine.saveManager.currentUser.username);
                }
                try { sessionStorage.setItem('jumpToAbout', '1'); } catch(e) {}
                window.location.href = card.dataset.profile;      // 当前页内跳转
            });
        });
    }
    
};

export default AboutView;