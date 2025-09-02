import GameEngine from './core/GameEngine.js';

// 等待DOM完全加载后再启动游戏
document.addEventListener('DOMContentLoaded', async () => { // <--- 1. 在这里添加 async
    const appContainer = document.getElementById('app-container');
    const game = new GameEngine(appContainer);
    
    await game.init(); // <--- 2. 在这里添加 await

    // 现在，这段代码会确保在 game.init() 完全结束后才执行
    try {
        if (sessionStorage.getItem('jumpToAbout') === '1') {
            sessionStorage.removeItem('jumpToAbout');
            game.showView('About');
        }
    } catch (e) {}
});