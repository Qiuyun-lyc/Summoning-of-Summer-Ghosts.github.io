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
import OpeningView from '../views/OpeningView.js';

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
            isHistoryVisible: false,
            historyCheckpoint: -1,
            isAutoPlay: false,
            isVoicePlaying: false, // 新增状态标志，用于明确告知是否有有效语音在播放
        };

        this.views = {
            Opening: OpeningView,
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
         this.autoAdvanceTimer = null;
        this.autoAdvanceAudioListener = null; 
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
        this.cancelAutoAdvance(); 
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

        let isNewGame = false; // 标记是否为新游戏
        if (!saveData.saveDate) {
            this.gameState.interactionCount = 0;
            this.gameState.fastForwardTooltipShown = false;
            isNewGame = true;
        }
        
        this.showView('Game');
        await this.processNode(this.gameState.currentSave.nodeId);

        // 关键修复：在处理完第一个节点后，再执行淡出动画
        // 这个fadeOutBlack会移除OpeningView留下的黑色遮罩
        await this.animation.play('fadeOutBlack');

        // 关键修复：在屏幕完全可见后，再显示提示框
        if (isNewGame) {
            this.uiManager.displayTooltip(
                `点击屏幕或按 <kbd>空格键</kbd> 继续`, 
                0 
            );
        }
    }
    
    startNewGame() {
        const newSave = this.saveManager.createNewSave();
        this.showView('Opening', { newGameSave: newSave });
    }

    toggleAutoPlay() {
        this.gameState.isAutoPlay = !this.gameState.isAutoPlay;
        this.uiManager.updateAutoPlayButton(this.gameState.isAutoPlay);

        if (this.gameState.isAutoPlay) {
            // 如果当前没有在播放语音，则立即调度，否则等待语音结束
            if (!this.gameState.isVoicePlaying || this.audioManager.voicePlayer.ended) {
                 this.scheduleAutoAdvance();
            }
        } else {
            this.cancelAutoAdvance();
        }
    }

    cancelAutoAdvance() {
        if (this.autoAdvanceTimer) {
            clearTimeout(this.autoAdvanceTimer);
            clearInterval(this.autoAdvanceTimer);
            this.autoAdvanceTimer = null;
        }
        if (this.autoAdvanceAudioListener) {
            this.audioManager.voicePlayer.removeEventListener('ended', this.autoAdvanceAudioListener);
            this.autoAdvanceAudioListener = null;
        }
    }
    
    async _checkFileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD', cache: 'no-cache' });
            return response.ok;
        } catch (error) {
            return false;
        }
    }


    scheduleAutoAdvance() {
        this.cancelAutoAdvance();
        if (!this.gameState.isAutoPlay) return;
        if (this.uiManager.isPrinting()) {
            this.autoAdvanceTimer = setInterval(() => {
                if (!this.uiManager.isPrinting()) {
                    this.cancelAutoAdvance();
                    this.scheduleAutoAdvance();
                }
            }, 100);
            return;
        }

        const currentNode = this.dataManager.getNode(this.gameState.currentSave.nodeId);
        if (currentNode.type === 'choices') {
            return;
        }

        if (this.gameState.isVoicePlaying) {
            this.autoAdvanceAudioListener = () => this.requestPlayerInput();
            this.audioManager.voicePlayer.addEventListener('ended', this.autoAdvanceAudioListener, { once: true });
        } else {
            const textKey = `story.nodes.${this.gameState.currentSave.nodeId}.text`;
            const textContent = this.localization.get(textKey) || '';
            const delay = 1500 + (textContent.length / 8) * 1000;
            this.autoAdvanceTimer = setTimeout(() => this.requestPlayerInput(), delay);
        }
    }


    async resumeGame() {
        this.showView('Game');
        await this.processNode(this.gameState.currentSave.nodeId);
    }

    async returnToGame() {
        if (this.gameState.historyCheckpoint !== -1) {
            this.gameState.currentSave.dialogueHistory.length = this.gameState.historyCheckpoint;
            this.gameState.historyCheckpoint = -1;
        }

        this.showView('Game');
        await this.processNode(this.gameState.currentSave.nodeId);
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
            this.cancelAutoAdvance(); 
            this.gameState.historyCheckpoint = this.gameState.currentSave.dialogueHistory.length;
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
            
            const history = this.gameState.currentSave.dialogueHistory;
            const lastEntry = history.length > 0 ? history[history.length - 1] : null;

            if (!lastEntry || lastEntry.nodeId !== historyEntry.nodeId || lastEntry.speaker !== historyEntry.speaker) {
                history.push(historyEntry);
            }
        }

        this.gameState.isVoicePlaying = false; 

        if (node.voice && node.voice !== "null") {
            const voicePath = `./assets/voice/${node.voice}.mp3`;
            const voiceExists = await this._checkFileExists(voicePath);

            if (voiceExists) {
                this.audioManager.playVoice(voicePath);
                this.gameState.isVoicePlaying = true;
            } else {
                console.warn(`语音文件不存在: ${voicePath}. 将使用文本计时器。`);
                this.audioManager.stopVoice();
                this.gameState.isVoicePlaying = false;
            }
        } else {
            this.audioManager.stopVoice();
            this.gameState.isVoicePlaying = false;
        }

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
        if (node.type === 'animation') { }
        this.scheduleAutoAdvance(); 
    }
    
    async handleAnimation(node) {
        await this.animation.play(node.animation);
        this.requestPlayerInput(); 
    }

    requestPlayerInput(choiceIndex = null) {
        if (this.gameState.interactionCount !== undefined && this.gameState.interactionCount < 4) {
            this.gameState.interactionCount++;
            if (this.gameState.interactionCount === 4) {
                this.uiManager.hideTooltip();
            }
        }
        
        this.cancelAutoAdvance();
        if (this.gameState.isInputDisabled || this.gameState.isPaused || this.gameState.isHistoryVisible) return;
        this.setInputDisabled(true);
        this._handlePlayerInput(choiceIndex).finally(() => {
            this.setInputDisabled(false);
        });
    }

    async _handlePlayerInput(choiceIndex = null) {
        this.audioManager.stopVoice();

        if (this.uiManager.isPrinting()) {
            this.uiManager.skipPrinting();
            this.scheduleAutoAdvance();
            return;
        }
        
        const currentNodeId = this.gameState.currentSave.nodeId;
        const node = this.dataManager.getNode(currentNodeId);
        if (!node || !node.onNext) return;

        const onNext = node.onNext;
        let nextNodeId = null;

        if (onNext.choice) {
            if (choiceIndex !== null && onNext.choice[choiceIndex]) {
                const choiceTextKey = `story.nodes.${currentNodeId}.choices`;
                const choiceTexts = this.localization.get(choiceTextKey);
                const selectedText = choiceTexts[choiceIndex];
                
                const choiceEntry = {
                    type: 'choice', 
                    text: selectedText
                };
                this.gameState.currentSave.dialogueHistory.push(choiceEntry);

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
            await this.processNode(nextNodeId);
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