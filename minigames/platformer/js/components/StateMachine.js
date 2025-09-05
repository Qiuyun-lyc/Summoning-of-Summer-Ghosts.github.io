export class StateMachine {
    constructor() {
        this.states = new Map();
        this.currentState = null;
    }

    addState(name, stateInstance) {
        this.states.set(name, stateInstance);
    }

    setState(name) {
        if (this.currentState && this.currentState.state === name) {
            return;
        }
        
        const newState = this.states.get(name);
        if (!newState) {
            console.error(`State "${name}" not found.`);
            return;
        }

        this.currentState = newState;
        this.currentState.enter();
    }
}