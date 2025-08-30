const LoadView = {
    render: (container, engine) => {
        const L = engine.localization;
        container.innerHTML = `
            <div class="view load-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/test.png');"></div>
                <nav class="navbar">
                    <span>SAVEDATA</span>
                    <div>
                        <button id="back-to-menu">${L.get('ui.title')}</button>
                        ${engine.gameState.currentSave ? `<button id="back-to-game">${L.get('ui.continue')}</button>` : ''}
                    </div>
                </nav>
                <div class="save-slots-container">
                    <!-- 存档槽将在此生成 -->
                </div>
            </div>
        `;
        
        const slotsContainer = container.querySelector('.save-slots-container');
        const saves = engine.saveManager.currentUser.saveArray;

        saves.forEach((save, index) => {
            const slot = document.createElement('div');
            slot.className = 'save-slot';
            
            const nodeData = save ? engine.dataManager.getNode(save.nodeId) : null;
            const thumbnail = nodeData && nodeData.bgr ? `./assets/img/bgr/${nodeData.bgr}.png` : './assets/img/bgr/test.jpg';
            const chapter = nodeData ? `章节 ${Math.floor(save.nodeId / 100)}` : '---';
            const saveDate = save ? save.saveDate : '空';

            slot.innerHTML = `
                <img class="save-slot-bg" src="./assets/img/menuBox/paper2.png">
                <div class="save-info">
                    <h3>存档 ${index + 1}</h3>
                    <p>${saveDate}</p>
                    <div class="save-buttons">
                        <div class="action-button" data-action="load" data-slot="${index}">
                           <img class="button-icon" src="./assets/img/load.png">
                           <img class="button-icon-hover" src="./assets/img/load_hover.png">
                        </div>
                        <div class="action-button" data-action="save" data-slot="${index}">
                           <img class="button-icon" src="./assets/img/save.png">
                           <img class="button-icon-hover" src="./assets/img/save_hover.png">
                        </div>
                    </div>
                </div>
                <div class="save-chapter">${chapter}</div>
                <div class="save-thumbnail"><img src="${thumbnail}"></div>
            `;
            slotsContainer.appendChild(slot);
        });
    },
    attachEventListeners: (container, engine) => {
        document.getElementById('back-to-menu').addEventListener('click', () => engine.showView('MainMenu'));
        document.getElementById('back-to-game')?.addEventListener('click', () => engine.showView('Game'));
        
        container.querySelectorAll('.action-button').forEach(button => {
            button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));
            button.addEventListener('click', (e) => {
                engine.audioManager.playSoundEffect('click');
                const action = e.currentTarget.dataset.action;
                const slot = parseInt(e.currentTarget.dataset.slot);

                if (action === 'load') {
                    const saveData = engine.saveManager.loadGame(slot);
                    if (saveData) {
                        engine.startGame(saveData);
                    } else {
                        alert("空存档，无法读取。");
                    }
                } else if (action === 'save') {
                    if (engine.gameState.currentSave) {
                        if (engine.saveManager.saveGame(slot, engine.gameState.currentSave)) {
                            alert(`存档到栏位 ${slot + 1} 成功！`);
                            LoadView.render(container, engine); // 重新渲染以显示更新信息
                            LoadView.attachEventListeners(container, engine);
                        }
                    } else {
                        alert("没有正在进行的游戏可以存档。");
                    }
                }
            });
        });
    }
};

export default LoadView;