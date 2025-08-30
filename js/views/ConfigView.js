const ConfigView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
             <div class="view config-view">
                 <div class="bg" style="background-image: url('./assets/img/bg_ap.png');"></div>
                 <nav class="navbar">
                     <span>CONFIG</span>
                     <div>
                         <button id="back-to-menu">${L.get('ui.title')}</button>
                     </div>
                 </nav>
                 <div class="settingBox">
                     <img class="auth-form-img" src="./assets/img/menuBox/paper.png">
                     <div class="setting">
                         <label for="gameBgmVolume">游戏内BGM音量:</label>
                         <input type="range" id="gameBgmVolume" min="0" max="1" step="0.01">
                     </div>
                      <div class="setting">
                         <label for="indexBgmVolume">主菜单BGM音量:</label>
                         <input type="range" id="indexBgmVolume" min="0" max="1" step="0.01">
                     </div>
                     <div class="setting">
                         <label for="sfxVolume">系统音效音量:</label>
                         <input type="range" id="sfxVolume" min="0" max="1" step="0.01">
                     </div>
                 </div>
             </div>
        `;
        
        // 从AudioManager设置初始滑块值
        document.getElementById('gameBgmVolume').value = engine.audioManager.volumes.gameBgm;
        document.getElementById('indexBgmVolume').value = engine.audioManager.volumes.indexBgm;
        document.getElementById('sfxVolume').value = engine.audioManager.volumes.sfx;
    },
    attachEventListeners: (container, engine) => {
        document.getElementById('back-to-menu').addEventListener('click', () => engine.showView('MainMenu'));

        document.getElementById('gameBgmVolume').addEventListener('input', (e) => {
            engine.audioManager.setVolume('gameBgm', e.target.value);
        });
        document.getElementById('indexBgmVolume').addEventListener('input', (e) => {
            engine.audioManager.setVolume('indexBgm', e.target.value);
        });
        document.getElementById('sfxVolume').addEventListener('input', (e) => {
            engine.audioManager.setVolume('sfx', e.target.value);
        });
    }
};
export default ConfigView;