// 成就界面视图对象
const AchievementView = {
    totalSlots: 16, // 固定成就槽数量
    slotsPerRow: 4, // 每行成就数量

    render: (container, engine) => {
        const L = engine.localization;
        const allAchievements = engine.dataManager.getAllAchievements();
        const unlockedIds = engine.saveManager.currentUser.achievementArray;
        const lockedIcon = engine.dataManager.getLockedAchievementIcon();

        // 取前16个成就，如果不足16个，用空占位
        const achievementsToRender = allAchievements.slice(0, AchievementView.totalSlots);
        while (achievementsToRender.length < AchievementView.totalSlots) {
            achievementsToRender.push(null); // 空占位
        }

        // 将成就按行分组，每行4个
        const rows = [];
        for (let i = 0; i < achievementsToRender.length; i += AchievementView.slotsPerRow) {
            rows.push(achievementsToRender.slice(i, i + AchievementView.slotsPerRow));
        }

        // 每行生成 HTML
        const rowsHTML = rows.map((row, rowIndex) => {
            const rowCategory = `类别 ${rowIndex + 1}`; // 可根据需要修改成真实类别名称
            const rowItemsHTML = row.map(ach => {
                if (ach) {
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
                } else {
                    return `<div class="achievement-item empty"></div>`;
                }
            }).join('');

            return `
                <div class="achievement-row">
                    <h2 class="row-category">${rowCategory}</h2>
                    <div class="achievement-row-items">
                        ${rowItemsHTML}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <style>
                .achievement-view {
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                }

                .navbar {
                    height: 100px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    position: relative;
                    z-index: 10;
                }

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

                /* 每行成就容器 */
                .achievement-row {
                    margin-bottom: 40px;
                }

                .row-category {
                    text-align: center;
                    font-size: 1.6em;
                    color: #ffd700;
                    margin-bottom: 15px;
                    text-shadow: 1px 1px 3px #000;
                }

                /* 每行成就格子容器 */
                .achievement-row-items {
                    display: flex;
                    justify-content: space-around; /* 每行均分空间 */
                    flex-wrap: wrap;
                    gap: 25px;
                }

                .achievement-item {
                    background-color: rgba(0, 0, 0, 0.4);
                    border-radius: 15px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    width: 100%;
                    max-width: 220px;
                    min-height: 130px;
                    box-sizing: border-box;
                }

                .achievement-item.empty {
                    background: transparent;
                    border: none;
                }

                .achievement-item.unlocked {
                    border-color: #ffd700;
                    box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
                }

                .achievement-item:hover {
                    transform: translateY(-5px);
                    background-color: rgba(255, 255, 255, 0.1);
                }

                .achievement-icon {
                    width: 90px;
                    height: 90px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #fff;
                    flex-shrink: 0;
                }

                .achievement-item.locked .achievement-icon {
                    filter: grayscale(100%) brightness(0.7);
                }

                .achievement-info h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.4em;
                    color: #fff;
                }

                .achievement-item.locked .achievement-info h3 {
                    color: #aaa;
                }

                .achievement-info p {
                    margin: 0;
                    font-size: 1em;
                    color: #ccc;
                    line-height: 1.4;
                }
            </style>

            <div class="view achievement-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>

                <nav class="navbar" id="achievement-navbar">
                    <button class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.achievement')}</span>
                    </button>

                    <button id="back-to-menu" class="menu-button">
                        <img class="button-img" src="./assets/img/button.png">
                        <span>${L.get('ui.title')}</span>
                    </button>
                </nav>

                <div class="achievement-grid-container">
                    ${rowsHTML}
                </div>
            </div>
        `;

        AchievementView.attachEventListeners(container, engine);
    },

    attachEventListeners: (container, engine) => {
        document.getElementById('back-to-menu').addEventListener('click', () => {
            engine.audioManager.playSoundEffect('click');
            engine.showView('MainMenu');
        });
    }
};

export default AchievementView;
