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
            const name = isUnlocked ? ach.name : '？？？';
            const description = isUnlocked ? ach.description : '解锁条件未达成';

            return `
                <div class="achievement-item ${statusClass}">
                    <img class="achievement-icon" src="${iconSrc}">
                    <div class="achievement-details">
                        <h3 class="achievement-title">${name}</h3>
                        <p class="achievement-desc">${description}</p>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="view achievement-view">
                <div class="bg" style="background-image: url('./assets/img/bgr/mainmenu.png');"></div>
                <nav class="navbar">
                    <span>${L.get('ui.achievement')}</span>
                    <div>
                        <button id="back-to-menu">${L.get('ui.title')}</button>
                    </div>
                </nav>
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