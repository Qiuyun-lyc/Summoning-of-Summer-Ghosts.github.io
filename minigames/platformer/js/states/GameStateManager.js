export class GameStateManager {
    constructor(game) {
        this.game = game;
        this.states = new Map(); //使用Map存储所有状态
        this.currentState = null;
    }

    addState(name, stateInstance) {
        this.states.set(name, stateInstance);
        //为状态实例注入game和manager的引用，方便其内部调用
        stateInstance.game = this.game; 
        stateInstance.manager = this;
    }

    setState(name, enterParams = {}) {
        if (this.currentState) {
            this.currentState.exit();
        }

        const newState = this.states.get(name);
        this.currentState = newState;
        this.currentState.enter(enterParams);
    }

    update(deltaTime, input) {
        if (this.currentState) {
            this.currentState.update(deltaTime, input);
        }
    }

    draw() {
        if (this.currentState) {
            this.currentState.draw();
        }
    }
}
