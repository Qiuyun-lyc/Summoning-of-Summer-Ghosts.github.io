import UIManager from './UIManager.js';
import DataManager from './DataManager.js';
import SaveManager from './SaveManager.js';
import AudioManager from './AudioManager.js';
import Animation from '../modules/Animation.js';
import Localization from '../modules/Localization.js';

import LoginView from '../views/LoginView.js';
import RegisterView from '../views/RegisterView.js';
import MainMenuView from '../views/MainMenuView.js';
import GameView from '../views/GameView.js';
import LoadView from '../views/LoadView.js';
import AchievementView from '../views/AchievementView.js';
import AboutView from '../views/AboutView.js';

export default class GameEngine {
    constructor(container) {
        this.container = container;
        this.dataManager = new DataManager();
        this.saveManager = new SaveManager(this);
        this.audioManager = new AudioManager();
        this.animation = new Animation();
        this.localization = new Localization(this.dataManager);
        this.uiManager = new UIManager(this);

        this.gameState = {
            currentSave: null,
            isPaused: false,
            isInputDisabled: false,
        };

        this.views = {
            Login: LoginView,
            Register: RegisterView,
            MainMenu: MainMenuView,
            Game: GameView,
            Load: LoadView,
            Achievement: AchievementView, 
            About: AboutView
        };
    }

    async init() {
        try {
            // 检查当前会话是否已经有登录信息
            if (!sessionStorage.getItem('loginUser')) {
                // 如果没有，检查是否存在用于跨页恢复的“过桥”令牌
                const activeUser = localStorage.getItem('activeSessionUser');
                if (activeUser) {
                    // 如果找到了令牌，说明用户是从团队页面返回的
                    console.log('检测到从外部页面返回，正在恢复会话...');
                    // 1. 使用令牌恢复 sessionStorage
                    sessionStorage.setItem('loginUser', activeUser);
                    // 2. 立即删除令牌，因为它是一次性的！
                    localStorage.removeItem('activeSessionUser');
                }
            }
        } catch (e) {
            console.error('恢复会话状态时发生错误:', e);
        }
        // 添加事件监听器 
        window.addEventListener('achievementUnlocked', (event) => {
            const achievementId = event.detail.achievementId;
            // 调用UI管理器来显示提示
            this.uiManager.showAchievementPopup(achievementId);
        });

        await this.dataManager.loadAllData();
        this.audioManager.init();
        
        if (this.saveManager.isLoggedIn()) {
            this.showView('MainMenu');
        } else {
            this.showView('Login');
        }
    }

    showView(viewName) {
        this.uiManager.clearContainer();
        const view = this.views[viewName];
        if (view) {
            view.render(this.container, this);
            view.attachEventListeners(this.container, this);
        } else {
            console.error(`视图 "${viewName}" 未找到。`);
        }
    }
    
    async startGame(saveData) {
        this.gameState.currentSave = saveData;
        this.showView('Game');
        this.processNode(this.gameState.currentSave.nodeId);
    }
    
    startNewGame() {
        const newSave = this.saveManager.createNewSave();
        this.startGame(newSave);
    }
    async resumeGame() {
        //先显示游戏视图的空框架
        this.showView('Game');
        
        // 使用当前存档的节点ID，重新处理并绘制当前节点
        this.processNode(this.gameState.currentSave.nodeId);
    }
    async preloadAssetsForNode(node) {
        const assetsToLoad = [];

        // 收集需要加载的图片路径
        if (node.bgr) {
            assetsToLoad.push(`./assets/img/bgr/${node.bgr}.png`);
        }
        if (node.lCharactor) {
            assetsToLoad.push(`./assets/img/character/${node.lCharactor}.png`);
        }
        if (node.rCharactor) {
            assetsToLoad.push(`./assets/img/character/${node.rCharactor}.png`);
        }

        if (assetsToLoad.length === 0) {
            return Promise.resolve(); // 如果没有要加载的资源，直接返回
        }

        // 并行加载所有图片
        const promises = assetsToLoad.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            });
        });

        // 等待所有图片都加载完成
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error("Error preloading assets:", error);
        }
    }

    async processNode(nodeId) {
        const node = this.dataManager.getNode(nodeId);
        if (!node) return;

        await this.preloadAssetsForNode(node); 
        this.gameState.currentSave.nodeId = nodeId;
        this.uiManager.renderNode(node);

        if (node.bgm) {
            this.audioManager.playBgm(`./assets/bgm/${node.bgm}.mp3`);
        } else if (node.bgm === null) {
            this.audioManager.stopBgm();
        }
        
        if (node.unlockAchievement) {
            this.saveManager.unlockAchievement(node.unlockAchievement);
        }
        
        if (node.onEnter) { }
        if (node.type === 'animation') {  }
    }
    
    async handleAnimation(node) {
        this.setInputDisabled(true);
        await this.animation.play(node.animation);
        this.setInputDisabled(false);
        this.handlePlayerInput();
    }

    async handlePlayerInput(choiceIndex = null) {
        if (this.gameState.isInputDisabled || this.gameState.isPaused) return;
        if (this.uiManager.isPrinting()) {
            this.uiManager.skipPrinting();
            return;
        }
        const currentNodeId = this.gameState.currentSave.nodeId;
        const node = this.dataManager.getNode(currentNodeId);
        const onNext = node.onNext;
        if (!onNext) return;
        let nextNodeId = null;
        if (onNext.nextNode) {
            nextNodeId = parseInt(currentNodeId) + 1;
        } else if (onNext.setNode) {
            nextNodeId = onNext.setNode;
        } else if (onNext.choice && choiceIndex !== null) {
            const choice = onNext.choice[choiceIndex];
            if(choice) {
                if (choice.loveValue) {
                    this.gameState.currentSave.LoveValue = (this.gameState.currentSave.LoveValue || 0) + choice.loveValue;
                }
                nextNodeId = choice.targetNode;
            }
        } else if (onNext.ending) {
            this.showView('MainMenu');
            return;
        }
        if (nextNodeId !== null) {
            this.processNode(nextNodeId);
        }
    }
    
    setInputDisabled(isDisabled) {
        this.gameState.isInputDisabled = isDisabled;
    }

    pauseGame() {
        if (this.gameState.isPaused) return;
        this.gameState.isPaused = true;
        this.uiManager.togglePauseMenu(true);
    }

    unpauseGame() {
        if (!this.gameState.isPaused) return;
        this.gameState.isPaused = false;
        this.uiManager.togglePauseMenu(false);
    }
}