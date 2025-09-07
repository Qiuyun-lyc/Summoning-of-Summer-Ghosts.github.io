// 成就界面视图对象
const AchievementView = {
    totalSlots: 16, // 固定成就槽数量（4组 * 每组4个）
    slotsPerGroup: 4, // 每组显示 4 个
    categories: ["友也", "葵", "凉", "绚音"],

    render: (container, engine) => {
        const L = engine.localization;
        const allAchievements = engine.dataManager.getAllAchievements();
        const unlockedIds = engine.saveManager.currentUser.achievementArray;
        const lockedIcon = engine.dataManager.getLockedAchievementIcon();

        const traitByIndex = ["warm", "brave", "cool", "mystic"];

        const achievementsToRender = allAchievements.slice(0, AchievementView.totalSlots);
        while (achievementsToRender.length < AchievementView.totalSlots) achievementsToRender.push(null);

        // 分组
        const groups = [];
        for (let i = 0; i < achievementsToRender.length; i += AchievementView.slotsPerGroup) {
            groups.push(achievementsToRender.slice(i, i + AchievementView.slotsPerGroup));
        }

        // 每组生成 HTML
        const groupsHTML = groups.map((group, groupIndex) => {
            const rowCategory = AchievementView.categories[groupIndex] || `类别 ${groupIndex + 1}`;
            const traitKey = traitByIndex[groupIndex] || "warm";

            const itemsHTML = group.map((ach) => {
                if (ach) {
                    const isUnlocked = unlockedIds.includes(ach.id);
                    const statusClass = isUnlocked ? 'unlocked' : 'locked';
                    const iconSrc = isUnlocked ? ach.icon : lockedIcon;
                    const name = isUnlocked ? `<h3>${ach.name}</h3>` : '<h3>？？？</h3>';
                    const description = isUnlocked ? `<p>${ach.description}</p>` : '<p>解锁条件未达成</p>';
                    return `
                        <div class="achievement-item ${statusClass}" title="${isUnlocked ? ach.name : '未解锁'}">
                            <img class="achievement-icon" src="${iconSrc}" alt="${isUnlocked ? ach.name : '未解锁'}">
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
                <div class="achievement-group">
                    <!-- 给分类标题打上 data-trait 以套用对应性格配色 -->
                    <h2 class="row-category" data-trait="${traitKey}">${rowCategory}</h2>
                    <div class="achievement-group-items">
                        ${itemsHTML}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <style>
                .achievement-view {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }

                .navbar {
                    height: 100px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 0 40px;
                    position: sticky;
                    top: 0;
                    z-index: 20;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                }

                .menu-button {
                    position: relative;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-family: 'lilyshow','FangSong','仿宋','SimSun',sans-serif;
                    padding: 0;
                }

                .menu-button img { display: block; }

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
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 40px 20px; /* 去掉顶部内边距，避免与导航产生缝隙 */
                    box-sizing: border-box;
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .achievement-grid-container::-webkit-scrollbar { display: none; }

                .achievement-group {
                    margin-bottom: 50px;
                    position: relative; /* sticky 需要父容器 */
                }

                /* —— 固定类别标题（分类栏） —— */
                .row-category{
                    position: sticky;
                    top: 0;
                    z-index: 15;

                    text-align: center;
                    font-size: 1.6em;
                    color: #ffd700;
                    margin: 0 0 10px;

                    /* 毛玻璃底色 */
                    background-color: rgba(15,15,25,0.85);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);

                    padding: 20px;

                    /* 圆角与投影 */
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(255,255,255,0.12);
                    box-shadow: 0 6px 18px rgba(0,0,0,.35);
                }

                /* —— 性格主题着色（轻度覆盖层，保证文本可读） —— */
                .row-category::before{
                    content:"";
                    position:absolute; inset:0;
                    background: var(--cat-tint, transparent);
                    opacity:.25;            /* 透明度可按需微调 */
                    pointer-events:none;
                }
                /* 温柔/治愈（友也） */
                .row-category[data-trait="warm"]   { --cat-tint: linear-gradient(135deg,#ff9a9e 0%, #57babae2 100%); }
                /* 阳光/热情（葵） */
                .row-category[data-trait="brave"]  { --cat-tint: linear-gradient(135deg,#ff512f 0%, #f09819 100%); }
                /* 冷静/理智（凉） */
                .row-category[data-trait="cool"]   { --cat-tint: linear-gradient(135deg,#36d1dc 0%, #5a00c762 100%); }
                /* 神秘/文艺（绚音） */
                .row-category[data-trait="mystic"] { --cat-tint: linear-gradient(135deg,#6a11cb 0%, #fecfef 100%); }

                /* 成就槽布局 */
                .achievement-group-items {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 25px;
                    justify-items: center;
                }

                .achievement-item {
                    background-color: rgba(0, 0, 0, 0.4);
                    border-radius: 15px;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: flex-start;
                    transition: all 0.3s ease;
                    border: 2px solid transparent;
                    width: 100%;
                    max-width: 300px;
                    height: 300px;
                    box-sizing: border-box;
                    text-align: center;
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
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #fff;
                    flex-shrink: 0;
                    margin-bottom: 10px;
                }

                .achievement-item.locked .achievement-icon {
                    filter: grayscale(100%) brightness(0.7);
                }

                .achievement-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                }

                .achievement-info h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.5em;
                    color: #fff;
                }

                .achievement-item.locked .achievement-info h3 { color: #aaa; }

                .achievement-info p {
                    margin: 0;
                    font-size: 1.2em;
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
                    ${groupsHTML}
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
