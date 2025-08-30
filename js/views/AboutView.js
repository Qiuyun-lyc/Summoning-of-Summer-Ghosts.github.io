// 文件路径: js/views/AboutView.js

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
                    <iframe src="./关于.html" frameborder="0"></iframe>
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