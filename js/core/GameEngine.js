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
import MinigameView from '../views/MinigameView.js';
import EndingView from '../views/EndingView.js';

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
            About: AboutView,
            Minigame: MinigameView,
            Ending: EndingView,
        };
    }

    async init() {
        try {
            if (!sessionStorage.getItem('loginUser')) {
                const activeUser = localStorage.getItem('activeSessionUser');
                if (activeUser) {
                    console.log('检测到从外部页面返回，正在恢复会话...');
                    sessionStorage.setItem('loginUser', activeUser);
                    localStorage.removeItem('activeSessionUser');
                }
            }
        } catch (e) {
            console.error('恢复会话状态时发生错误:', e);
        }
        window.addEventListener('achievementUnlocked', (event) => {
            const achievementId = event.detail.achievementId;
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

    showView(viewName, params = {}) {
        this.uiManager.clearContainer();
        const view = this.views[viewName];
        if (view) {
            view.render(this.container, this, params);
            view.attachEventListeners(this.container, this, params);
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
        this.showView('Game');
        
        this.processNode(this.gameState.currentSave.nodeId);
    }
    async preloadAssetsForNode(node) {
        const assetsToLoad = [];

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
            return Promise.resolve(); 
        }

        const promises = assetsToLoad.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                img.src = src;
            });
        });

        try {
            await Promise.all(promises);
        } catch (error) {
            console.error("Error preloading assets:", error);
        }
    }

    async processNode(nodeId) {
        const node = this.dataManager.getNode(nodeId);
        if (!node) return;
        
        if (node.type === 'minigame') {
            console.log(`检测到小游戏节点 [${nodeId}]，正在启动...`);
            this.audioManager.stopBgm();
            this.showView('Minigame', { nodeData: node });
            return;
        }

        if (node.type === 'text' || node.type === 'choices') {
            const textKey = `story.nodes.${nodeId}.text`;
            const textContent = this.localization.get(textKey);
            const historyEntry = {
                speaker: node.name,
                text: textContent,
                nodeId: nodeId
            };
            this.gameState.currentSave.dialogueHistory.push(historyEntry);
        }


        await this.preloadAssetsForNode(node); 
        this.gameState.currentSave.nodeId = nodeId;
        this.uiManager.renderNode(node);

        if (node.bgm) {
            this.audioManager.playBgm(`./assets/bgm/${node.bgm}.mp3`);
        } else if (node.bgm === null) {
            this.audioManager.stopBgm();
        }

        if (node.voice) {
            this.audioManager.playVoice(`./assets/voice/${node.voice}.mp3`);
        } else {
            this.audioManager.stopVoice();
        }
        
        if (node.unlockAchievement) {
            this.saveManager.unlockAchievement(node.unlockAchievement);
        }
        
        if (node.onEnter) { }
        if (node.type === 'animation') { 

         }
    }
    
    async handleAnimation(node) {
        this.setInputDisabled(true);
        await this.animation.play(node.animation);
        this.setInputDisabled(false);
        this.handlePlayerInput();
    }

    async handlePlayerInput(choiceIndex = null) {
        if (this.gameState.isInputDisabled || this.gameState.isPaused) return;

        this.audioManager.stopVoice();

        if (this.uiManager.isPrinting()) {
            this.uiManager.skipPrinting();
            return;
        }
        
        const currentNodeId = this.gameState.currentSave.nodeId;
        const node = this.dataManager.getNode(currentNodeId);
        if (!node || !node.onNext) return;

        const onNext = node.onNext;
        let nextNodeId = null;

        if (onNext.choice) {
            if (choiceIndex !== null && onNext.choice[choiceIndex]) {
                const choice = onNext.choice[choiceIndex];
                if (choice.loveValue) {
                    this.gameState.currentSave.LoveValue = (this.gameState.currentSave.LoveValue || 0) + choice.loveValue;
                }
                nextNodeId = choice.targetNode;
            } else {
                return;
            }
        } else if (onNext.nextNode) {
            nextNodeId = parseInt(currentNodeId) + 1;
        } else if (onNext.setNode) {
            nextNodeId = onNext.setNode;
        } else if (onNext.ending) {
            console.log('检测到结局节点，准备播放片尾视频。');
            this.showView('Ending');
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