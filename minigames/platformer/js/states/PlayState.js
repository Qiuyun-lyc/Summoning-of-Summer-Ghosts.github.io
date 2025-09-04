import { BaseState } from './BaseState.js';
import { Scene } from '../core/Scene.js';
import { UIManager } from '../ui/UIManager.js';

export class PlayState extends BaseState {
    constructor() {
        super();           
        this.scene = null;
        this.uiManager = null;
    }

    enter(params) {
        this.scene = new Scene(params.level, this.game.assetManager);
        this.uiManager = new UIManager(this.game.canvas); 
    }

    exit() {
        this.scene = null;
        this.uiManager = null;
    }

    update(deltaTime, input) {
        if (this.scene) {
            this.scene.update(deltaTime, input);
        }
    }

    draw() {
        if (this.scene) {
            this.game.renderer.render(this.scene);
        }
        if (this.uiManager) {
            this.uiManager.draw();
        }
    }
}