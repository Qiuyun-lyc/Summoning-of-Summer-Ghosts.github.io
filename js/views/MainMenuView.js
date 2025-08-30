const MainMenuView = {
    render: (container, engine) => {
        const L = engine.localization;
        const bgImages = [
            './assets/img/bgr/mainmenu.png',
        ];
        const randomIndex = Math.floor(Math.random() * bgImages.length);
        
        container.innerHTML = `
            <div class="view main-menu-view">
                <div class="bg" style="background-image: url('${bgImages}');"></div>
                <div class="header fade-in">
                    <a class="header-title">夏日幻魂</a>
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
                    <div class="main-menu-button" data-action="config">
                        <img class="button-img" src="./assets/img/button.png">
                        <a>${L.get('ui.config')}</a>
                    </div>
                    <div class="main-menu-button" data-action="about">
                        <img class="button-img" src="./assets/img/button.png">
                        <a>${L.get('ui.about')}</a>
                    </div>
                </div>
            </div>
        `;
        // 播放合适的背景音乐
        const bgmMap = {
            './assets/img/bgr/mainmenu.png': './assets/bgm/test.mp3',
        };
        engine.audioManager.playBgm(bgmMap[bgImages], true);
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
                    case 'config':
                        engine.showView('Config');
                        break;
                    case 'about':
                        alert('test');
                        engine.showView('MainMenu'); 
                        break;
                }
            });
        });
    }
};
export default MainMenuView;