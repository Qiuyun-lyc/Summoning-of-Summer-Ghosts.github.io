import GameEngine from './core/GameEngine.js';

// 等待DOM完全加载后再启动游戏
document.addEventListener('DOMContentLoaded', () => {
    const appContainer = document.getElementById('app-container');
    const game = new GameEngine(appContainer);
    game.init(); 
});