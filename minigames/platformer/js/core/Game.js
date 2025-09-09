// minigames/platformer/js/core/Game.js

import { AssetManager } from './AssetManager.js';
import { InputHandler } from './InputHandler.js';
import { RendererSystem } from '../systems/RendererSystem.js';
import { GameStateManager } from '../states/GameStateManager.js';
import { PlayState } from '../states/PlayState.js';
import { achievementManager } from '../services/AchievementManager.js';
import { gameEvents } from './EventBus.js';

export class Game {
    constructor(canvas, config, onCompleteCallback) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.onComplete = onCompleteCallback;

        this.sfxVolume = 0.5;
        this.bgmVolume = 0.3;

        this.bgmPlayers = [null, null];
        this.activeBgmIndex = 0; 
        this.bgmLoopTimer = null;

        this.lastTime = 0;
        this.isRunning = false;
        
        this.accumulator = 0;
        this.timeStep = 1000 / 165;

        this.inputHandler = new InputHandler();
        this.assetManager = new AssetManager('minigames/platformer/');
        this.renderer = new RendererSystem(this.canvas);
        this.stateManager = new GameStateManager(this);
        this.achievementManager = achievementManager;

        this.timeLimit = (config.timeLimit || 99) * 1000;
        this.levelTimer = this.timeLimit;

        this.boundEntityDiedHandler = this._onEntityDied.bind(this);
        gameEvents.on('entityDied', this.boundEntityDiedHandler);
        
        this._gameLoop = this._gameLoop.bind(this);
    }

     playBgm(name) {
        const originalAudio = this.assetManager.getAudio(name);
        if (!originalAudio) return;

        this.bgmPlayers[0] = originalAudio.cloneNode();
        this.bgmPlayers[1] = originalAudio.cloneNode();

        this.activeBgmIndex = 0;
        const activePlayer = this.bgmPlayers[this.activeBgmIndex];
        activePlayer.volume = this.bgmVolume;
        activePlayer.play().catch(e => {});

        this.bgmLoopTimer = setInterval(() => {
            const currentPlayer = this.bgmPlayers[this.activeBgmIndex];
            const nextPlayer = this.bgmPlayers[1 - this.activeBgmIndex];

            if (currentPlayer.duration - currentPlayer.currentTime < 0.2) {
                nextPlayer.currentTime = 0;
                nextPlayer.volume = this.bgmVolume;
                nextPlayer.play().catch(e => {});
                
                this.activeBgmIndex = 1 - this.activeBgmIndex;
            }
        }, 10);
    }
    
    stopBgm() {
        this.bgmPlayers.forEach(player => {
            if (player) {
                player.pause();
            }
        });
        if (this.bgmLoopTimer) {
            clearInterval(this.bgmLoopTimer);
            this.bgmLoopTimer = null;
        }
    }
    
    playSoundEffect(name) {
        const sfx = this.assetManager.getAudio(name);
        if (sfx) {
            sfx.currentTime = 0;
            sfx.volume = this.sfxVolume;
            sfx.play().catch(e => {});
        }
    }

    _onOrbCollected() {
        const collectedCount = this.stateManager.currentState?.uiManager?.collectedOrbs || 0;
        const sfxIndex = collectedCount % 7 ; 
        this.playSoundEffect(`collect_${sfxIndex}`);
    }

    _onEntityDied(payload) {
        if (payload.gameObject.name === 'Player') {
            this._endGame({ status: 'lose' });
        }
    }

    async start() {
        this.renderer.handleResize();
        await this.assetManager.loadAll();
        this.stateManager.addState('PLAY', new PlayState());
        
        this.boundOrbCollectedHandler = this._onOrbCollected.bind(this);
        gameEvents.on('lightOrbCollected', this.boundOrbCollectedHandler);

        this.isRunning = true;
        this.lastTime = performance.now();
        this.levelTimer = this.timeLimit; 
        
        this.playBgm('rain_bgm');
        
        this.stateManager.setState('PLAY', { level: this.config.level });
        requestAnimationFrame(this._gameLoop);
    }
    
    stop() {
        this.isRunning = false;
        this.inputHandler.destroy();
        gameEvents.off('entityDied', this.boundEntityDiedHandler);
        if (this.boundOrbCollectedHandler) {
            gameEvents.off('lightOrbCollected', this.boundOrbCollectedHandler);
        }
        this.stopBgm();
    }

    _endGame(result) {
        if (!this.isRunning) return;
        this.stop();
        if (this.onComplete) {
            this.onComplete(result);
        }
    }

    _gameLoop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = (timestamp - this.lastTime);
        this.lastTime = timestamp;
        
        this.accumulator += deltaTime;

        while (this.accumulator >= this.timeStep) {
            this.update(this.timeStep, this.inputHandler);
            this.accumulator -= this.timeStep;
        }
        
        this.draw();
        this.inputHandler.consumeActionKeys();
        requestAnimationFrame(this._gameLoop);
    }

    update(timeStep, input) {
        this.stateManager.update(timeStep, input);

        if (this.isRunning) {
            this.levelTimer -= timeStep; 
            if (this.levelTimer <= 0) {
                this.levelTimer = 0;
                console.log("时间到！游戏失败。");
                this._endGame({ status: 'lose' });
            }
        }

        const uiManager = this.stateManager.currentState?.uiManager;
        if (uiManager) {
            if (this.config.winCondition.type === 'collect' && 
                uiManager.collectedOrbs >= this.config.winCondition.value) {
                this._endGame({ status: 'win', collected: uiManager.collectedOrbs });
            }
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stateManager.draw();
    }
}