// 存档/读档界面视图对象
const LoadView = {
    totalSlots: 30, // 固定存档槽数量

    // 渲染函数：生成并插入存档界面的 HTML 结构
    render: (container, engine) => {
        const L = engine.localization; // 本地化工具
        const saves = engine.saveManager.currentUser.saveArray;

        // 主体界面 HTML
        container.innerHTML = `
            <div class="view load-view">
                <!-- 背景图片 -->
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <!-- 顶部导航栏 -->
                <nav class="navbar">
                    <span class="main-menu-button" style="top:-20px;left:-15px">
                        <img class="button-img" src="./assets/img/button.png">
                        <a>存档系统</a>
                    </span>
                    <div>
                        <button id="back-to-menu" class="main-menu-button" style="top:-20px;right:-15px;background:none;border:none;font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;">
                            <img class="button-img" src="./assets/img/button.png">
                            <a>${L.get('ui.title')}</a>
                        </button>
                        ${engine.gameState.currentSave ? `
                            <button id="back-to-game" class="main-menu-button" style="top:-20px;right:800px;background:none;border:none;font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;">
                                <img class="button-img" src="./assets/img/button.png">
                                <a>${L.get('ui.continue')}</a>
                            </button>
                        ` : ''}
                    </div>
                </nav>

                <!-- 存档槽容器 -->
                <div class="save-slots-container"></div>
            </div>
        `;

        // 渲染所有存档槽
        const slotsContainer = container.querySelector('.save-slots-container');
        for (let i = 0; i < LoadView.totalSlots; i++) {
            const save = saves[i] || null;
            const nodeData = save ? engine.dataManager.getNode(save.nodeId) : null;
            const thumbnail = nodeData && nodeData.bgr ? `./assets/img/bgr/${nodeData.bgr}.png` : './assets/img/bgr/test.png';
            const chapter = nodeData ? `章节 ${Math.floor(save.nodeId / 100)}` : '---';
            const saveDate = save ? save.saveDate : '空';

            const slot = document.createElement('div');
            slot.className = 'save-slot';
            slot.innerHTML = `
                <img class="save-slot-bg" src="./assets/img/menuBox/paper2.png">
                <div class="save-info">
                    <h2>存档 ${i + 1}</h2>
                    <p class="save-date">${saveDate}</p>
                    <div class="save-buttons">
                        <div class="action-button" data-action="load" data-slot="${i}">
                            <img class="button-icon" src="./assets/img/load.png">
                            <img class="button-icon-hover" src="./assets/img/load_hover.png">
                        </div>
                        <div class="action-button" data-action="save" data-slot="${i}">
                            <img class="button-icon" src="./assets/img/save.png">
                            <img class="button-icon-hover" src="./assets/img/save_hover.png">
                        </div>
                    </div>
                </div>
                <div class="save-chapter">${chapter}</div>
                <div class="save-thumbnail"><img src="${thumbnail}" style="border-radius:10px"></div>
            `;
            slotsContainer.appendChild(slot);
        }

        // 绑定事件
        LoadView.attachEventListeners(container, engine);
    },

    // 绑定全局事件监听器
    attachEventListeners: (container, engine) => {
        document.getElementById('back-to-menu').addEventListener('click', () => engine.showView('MainMenu'));
        document.getElementById('back-to-game')?.addEventListener('click', () => engine.resumeGame());

        // 给存档槽按钮绑定事件
        LoadView.bindSlotButtons(container, engine);
    },

    // 给存档槽里的按钮绑定事件
    bindSlotButtons: (container, engine) => {
        container.querySelectorAll('.action-button').forEach(button => {
            if (!button.dataset.bound) {
                button.dataset.bound = "true";

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
                                LoadView.render(container, engine);
                            }
                        } else {
                            alert("没有正在进行的游戏可以存档。");
                        }
                    }
                });
            }
        });
    }
};

export default LoadView;
