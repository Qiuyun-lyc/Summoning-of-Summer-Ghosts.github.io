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
import ConfigView from '../views/ConfigView.js';
import AboutView from '../views/AboutView.js';

// 代表游戏的核心协调器
export default class GameEngine {
    constructor(container) {
        this.container = container;
        this.dataManager = new DataManager();
        this.saveManager = new SaveManager();
        this.audioManager = new AudioManager();
        this.animation = new Animation();
        this.localization = new Localization(this.dataManager);
        this.uiManager = new UIManager(this); // UIManager需要通过引擎访问其他服务

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
            Config: ConfigView,
            About: AboutView
        };
    }

    async init() {
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
            view.render(this.container, this);
            view.attachEventListeners(this.container, this);
        } else {
            console.error(`视图 "${viewName}" 未找到。`);
        }
    }
    
    startGame(saveData) {
        this.gameState.currentSave = saveData;
        this.showView('Game');
        this.processNode(this.gameState.currentSave.nodeId);
    }
    
    startNewGame() {
        const newSave = this.saveManager.createNewSave();
        this.startGame(newSave);
    }

    processNode(nodeId) {
        const node = this.dataManager.getNode(nodeId);
        if (!node) {
            console.error(`故事节点 ${nodeId} 未找到。`);
            return;
        }

        this.gameState.currentSave.nodeId = nodeId;
        this.uiManager.renderNode(node);

        if (node.bgm) {
            this.audioManager.playBgm(`./assets/bgm/${node.bgm}.mp3`);
        } else if (node.bgm === null) { //
            this.audioManager.stopBgm();
        }
        
        if (node.onEnter) {
            // 扩展以处理更复杂的onEnter逻辑(下阶段)
        }
        
        if (node.type === 'animation') {
            this.handleAnimation(node);
        }
    }
    
    async handleAnimation(node) {
        this.setInputDisabled(true);
        await this.animation.play(node.animation);
        this.setInputDisabled(false);
        this.handlePlayerInput(); // 动画结束后自动前进
    }

    handlePlayerInput(choiceIndex = null) {
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
            // 根据存档状态处理结局逻辑
            this.showView('MainMenu'); // 暂时简单返回主菜单
            return;
        }

        if (nextNodeId !== null) {
            this.processNode(nextNodeId);
        }
    }
    
    setInputDisabled(isDisabled) {
        this.gameState.isInputDisabled = isDisabled;
    }

    pauseGame(fromGameView = true) {
        if (this.gameState.isPaused) return;
        this.gameState.isPaused = true;
        this.uiManager.togglePauseMenu(true, fromGameView);
    }

    unpauseGame() {
        if (!this.gameState.isPaused) return;
        this.gameState.isPaused = false;
        this.uiManager.togglePauseMenu(false);
    }
}