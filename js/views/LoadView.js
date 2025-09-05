// 存档/读档界面视图对象
const LoadView = {
    // 每次懒加载的存档数量
    savesPerPage: 10,
    currentOffset: 0, // 当前已加载的数量

    // 渲染函数：生成并插入存档界面的 HTML 结构
    render: (container, engine) => {
        const L = engine.localization; // 本地化工具（用于多语言支持）
        LoadView.currentOffset = 0; // 每次进入界面重置偏移量

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
                        <!-- 如果有当前存档，则显示“继续游戏”按钮 (使用与“返回标题”相同的样式) -->
                        ${engine.gameState.currentSave ? `
                            <button id="back-to-game" class="main-menu-button" style="top:-20px;right:800px;background:none;border:none;font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;">
                                <img class="button-img" src="./assets/img/button.png">
                                <a>${L.get('ui.continue')}</a>
                            </button>
                        ` : ''}
                    </div>
                </nav>

                <!-- 存档槽容器（可滚动） -->
                <div class="save-slots-container"></div>

                <!-- 加载提示 -->
                <div class="loading-indicator" style="display:none;">Loading...</div>
            </div>
        `;

        // 初始化加载第一页存档
        LoadView.loadMoreSaves(container, engine);

        // 绑定事件
        LoadView.attachEventListeners(container, engine);
    },

    // 懒加载存档
    loadMoreSaves: (container, engine) => {
        const slotsContainer = container.querySelector('.save-slots-container');
        const saves = engine.saveManager.currentUser.saveArray;
        const start = LoadView.currentOffset;
        const end = Math.min(start + LoadView.savesPerPage, saves.length);

        // 如果已经加载完毕，直接返回
        if (start >= saves.length) return;

        // 显示 Loading 提示
        const loadingIndicator = container.querySelector('.loading-indicator');
        loadingIndicator.style.display = 'block';

        // 模拟加载延迟
        setTimeout(() => {
            for (let i = start; i < end; i++) {
                const save = saves[i];
                const slot = document.createElement('div');
                slot.className = 'save-slot';

                // 如果槽位有存档数据，则获取对应的剧情节点数据
                const nodeData = save ? engine.dataManager.getNode(save.nodeId) : null;
                const thumbnail = nodeData && nodeData.bgr ? `./assets/img/bgr/${nodeData.bgr}.png` : './assets/img/bgr/test.png';
                const chapter = nodeData ? `章节 ${Math.floor(save.nodeId / 100)}` : '---';
                const saveDate = save ? save.saveDate : '空';

                // 填充槽位 HTML
                slot.innerHTML = `
                    <img class="save-slot-bg" src="./assets/img/menuBox/paper2.png">
                    <div class="save-info">
                        <h2>存档 ${i + 1}</h2>
                        <p class="save-date">${saveDate}</p>
                        <div class="save-buttons">
                            <!-- 读档按钮 -->
                            <div class="action-button" data-action="load" data-slot="${i}">
                                <img class="button-icon" src="./assets/img/load.png">
                                <img class="button-icon-hover" src="./assets/img/load_hover.png">
                            </div>
                            <!-- 存档按钮 -->
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

            // 更新偏移量
            LoadView.currentOffset = end;
            // 隐藏 Loading 提示
            loadingIndicator.style.display = 'none';

            // 给新生成的按钮绑定事件
            LoadView.bindSlotButtons(container, engine);
        }, 1);
    },

    // 绑定全局事件监听器
    attachEventListeners: (container, engine) => {
        // 返回主菜单按钮
        document.getElementById('back-to-menu').addEventListener('click', () => engine.showView('MainMenu'));

        // 返回游戏按钮
                // 返回游戏按钮
        document.getElementById('back-to-game')?.addEventListener('click', () => engine.resumeGame());

        // 滚动监听：当接近底部时加载更多
        const slotsContainer = container.querySelector('.save-slots-container');
        slotsContainer.addEventListener('scroll', () => {
            if (slotsContainer.scrollTop + slotsContainer.clientHeight >= slotsContainer.scrollHeight - 10) {
                LoadView.loadMoreSaves(container, engine);
            }
        });

        // 首次加载时也绑定已有按钮
        LoadView.bindSlotButtons(container, engine);
    },

    // 给存档槽里的按钮绑定事件
    bindSlotButtons: (container, engine) => {
        container.querySelectorAll('.action-button').forEach(button => {
            if (!button.dataset.bound) { // 防止重复绑定
                button.dataset.bound = "true";

                // 鼠标悬停音效
                button.addEventListener('mouseover', () => engine.audioManager.playSoundEffect('hover'));

                // 点击事件
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

// 导出模块
export default LoadView;