// 成就界面视图对象
const AchievementView = {
    render: (container, engine) => {
        const L = engine.localization;
        const allAchievements = engine.dataManager.getAllAchievements();
        const unlockedIds = engine.saveManager.currentUser.achievementArray;
        const lockedIcon = engine.dataManager.getLockedAchievementIcon();

const achievementsHTML = allAchievements.map(ach => {
            const isUnlocked = unlockedIds.includes(ach.id);
            const statusClass = isUnlocked ? 'unlocked' : 'locked';
            const iconSrc = isUnlocked ? ach.icon : lockedIcon;
            const name = isUnlocked ? `<h3>${ach.name}</h3>` : '<h3>？？？</h3>';
            const description = isUnlocked ? `<p>${ach.description}</p>` : '<p>解锁条件未达成</p>';

            return `
                <div class="achievement-item ${statusClass}" title="${isUnlocked ? ach.name : '未解锁'}">
                    <img class="achievement-icon" src="${iconSrc}" alt="${name}">
                    <div class="achievement-info">
                        ${name}
                        ${description}
                    </div>
                </div>
            `;
        }).join('');

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

                .achievement-grid-container {
                    flex-grow: 1;
                    display: grid;
                    /* 关键改动：将最小宽度从 250px 增加到 320px */
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 35px; /* 稍微增大网格间距 */
                    padding: 40px;
                    overflow-y: auto;
                }

                /* 单个成就项目 */
                .achievement-item {
                    background-color: rgba(0, 0, 0, 0.4);
                    border-radius: 15px;
                    padding: 25px; /* 关键改动：增加内边距，让内部空间更大 */
                    display: flex;
                    align-items: center;
                    gap: 20px; /* 关键改动：增大图标和文字的间距 */
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                }

                .achievement-item.unlocked {
                    border-color: #ffd700;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
                }

                .achievement-item:hover {
                    transform: translateY(-5px);
                    background-color: rgba(255, 255, 255, 0.1);
                }

                /* 成就图标 */
                .achievement-icon {
                    width: 90px; /* 关键改动：增大图标宽度 */
                    height: 90px; /* 关键改动：增大图标高度 */
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #fff;
                    flex-shrink: 0; /* 防止图标在空间不足时被压缩 */
                }

                .achievement-item.locked .achievement-icon {
                    filter: grayscale(100%) brightness(0.7);
                }

                /* 成就信息 (名称和描述) */
                .achievement-info h3 {
                    margin: 0 0 8px 0; /* 增大标题和描述的间距 */
                    font-size: 1.4em; /* 关键改动：增大标题字体 */
                    color: #fff;
                }
                
                .achievement-item.locked .achievement-info h3 {
                    color: #aaa;
                }

                .achievement-info p {
                    margin: 0;
                    font-size: 1em; /* 关键改动：增大描述字体 */
                    color: #ccc;
                    line-height: 1.4; /* 增加行高，让描述更易读 */
                }


            </style>

            <div class="view achievement-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                
                <!-- 顶部导航栏 -->
                <nav class="navbar" id="achievement-navbar">
                    <!-- 我的成就 -->
                    <button class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.achievement')}</span>
                    </button>

                    <!-- 返回主菜单 -->
                    <button id="back-to-menu" class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.title')}</span>
                    </button>
                </nav>
                
                <!-- 成就展示网格 -->
                <div class="achievement-grid-container">
                    ${achievementsHTML}
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

export default AchievementView;
