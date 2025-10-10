const SettingsView = {
    render: (container, engine) => {
        const L = engine.localization;
        const audioManager = engine.audioManager;
        
        container.innerHTML = `
            <style>
                .settings-view {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                }
                .settings-panel {
                    width: 600px;
                    padding: 40px;
                    background-color: rgba(0, 0, 0, 0.75);
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                .settings-panel h2 {
                    text-align: center;
                    margin-top: 0;
                    margin-bottom: 40px;
                    font-size: 2.5em;
                }
                .setting-item {
                    display: flex;
                    align-items: center;
                    margin-bottom: 25px;
                }
                .setting-item label {
                    flex: 0 0 120px;
                    font-size: 1.5em;
                }
                .setting-item input[type="range"] {
                    flex-grow: 1;
                    cursor: pointer;
                }
                .settings-buttons {
                    margin-top: 40px;
                    display: flex;
                    justify-content: space-around;
                }
                .settings-button { /* 沿用主菜单按钮样式 */
                    position: relative;
                    cursor: pointer;
                    width: clamp(10px, 25vw, 300px);
                }
                .settings-button .button-img {
                    width: 100%;
                }
                .settings-button a {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: clamp(10px, 2vw, 300px);
                    color: white;
                }
            </style>
            <div class="view settings-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <div class="settings-panel">
                    <h2>设置</h2>
                    <div class="setting-item">
                        <label for="bgm-volume">背景音乐</label>
                        <input type="range" id="bgm-volume" min="0" max="1" step="0.01" value="${audioManager.volumes.indexBgm}">
                    </div>
                    <div class="setting-item">
                        <label for="voice-volume">人物语音</label>
                        <input type="range" id="voice-volume" min="0" max="1" step="0.01" value="${audioManager.volumes.voice}">
                    </div>
                    <div class="settings-buttons">
                        <div id="logout-btn" class="settings-button">
                             <img class="button-img" src="./assets/img/button.png">
                             <a>退出当前账号登录</a>
                        </div>
                        <div id="back-to-menu-btn" class="settings-button">
                             <img class="button-img" src="./assets/img/button.png">
                             <a>返回</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    attachEventListeners: (container, engine) => {
        const bgmSlider = document.getElementById('bgm-volume');
        const voiceSlider = document.getElementById('voice-volume');
        const logoutBtn = document.getElementById('logout-btn');
        const backBtn = document.getElementById('back-to-menu-btn');

        // 实时更新音量
        bgmSlider.addEventListener('input', () => {
            // 注意：主菜单BGM被标记为isIndex=true，所以我们调整indexBgm
            engine.audioManager.setVolume('indexBgm', bgmSlider.value);
            // 同时，为了游戏内BGM也能被设置，我们也更新gameBgm
            engine.audioManager.setVolume('gameBgm', bgmSlider.value);
        });

        voiceSlider.addEventListener('input', () => {
            engine.audioManager.setVolume('voice', voiceSlider.value);
        });

        // 退出登录
        logoutBtn.addEventListener('click', () => {
            engine.audioManager.playSoundEffect('click');
            if (confirm('您确定要退出登录吗？')) {
                engine.logout(); // 调用引擎的登出方法
            }
        });

        // 返回主菜单
        backBtn.addEventListener('click', () => {
            engine.audioManager.playSoundEffect('click');
            engine.showView('MainMenu');
        });

        // 添加悬停音效
        container.querySelectorAll('.settings-button').forEach(button => {
            button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));
        });
    }
};

export default SettingsView;