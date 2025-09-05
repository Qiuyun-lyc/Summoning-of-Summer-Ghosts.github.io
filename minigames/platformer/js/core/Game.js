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

        this.lastTime = 0;
        this.isRunning = false;
        this.inputHandler = new InputHandler();
        this.assetManager = new AssetManager('minigames/platformer/');
        this.renderer = new RendererSystem(this.canvas);
        this.stateManager = new GameStateManager(this);
        this.achievementManager = achievementManager;

        this.boundEntityDiedHandler = this._onEntityDied.bind(this);
        gameEvents.on('entityDied', this.boundEntityDiedHandler);
        
        this._gameLoop = this._gameLoop.bind(this);
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
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.stateManager.setState('PLAY', { level: this.config.level });
        requestAnimationFrame(this._gameLoop);
    }
    
    stop() {
        this.isRunning = false;
        this.inputHandler.destroy();
        gameEvents.off('entityDied', this.boundEntityDiedHandler);
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
        this.update(deltaTime, this.inputHandler);
        this.draw();
        this.inputHandler.consumeActionKeys();
        requestAnimationFrame(this._gameLoop);
    }

    update(deltaTime, input) {
        this.stateManager.update(deltaTime, input);

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