const AboutView = {
    render: (container, engine) => {
        const L = engine.localization;
        
        container.innerHTML = `
            <div class="view about-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <nav class="navbar">
                    <span>${L.get('ui.about')}</span>
                    <div>
                        <button id="back-to-menu">${L.get('ui.title')}</button>
                    </div>
                </nav>

                <div class="about-content">
                    <div class="about-content-wrapper">
                        <!-- 第一排 2 个，居中 -->
                        <div class="gallery row1">
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./photo/1.jpg" alt="正面图" />
                                    <img class="fanImg" src="./photo/1.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./photo/2.png" alt="正面图" />
                                    <img class="fanImg" src="./photo/2.png" alt="反面图" />
                                </div>
                            </div>
                        </div>

                        <!-- 第二排 3 个，均分 -->
                        <div class="gallery row2">
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./photo/3.jpg" alt="正面图" />
                                    <img class="fanImg" src="./photo/3.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./photo/4.jpg" alt="正面图" />
                                    <img class="fanImg" src="./photo/4.jpg" alt="反面图" />
                                </div>
                            </div>
                            <div class="icon_img">
                                <div class="flip-box">
                                    <img class="zhengImg" src="./photo/5.jpg" alt="正面图" />
                                    <img class="fanImg" src="./photo/5.jpg" alt="反面图" />
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