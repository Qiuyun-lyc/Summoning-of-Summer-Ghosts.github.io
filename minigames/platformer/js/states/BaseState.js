export class BaseState {
    constructor() {
        this.game = null;
        this.manager = null;
    }
    enter(params) {}
    exit() {}
    update(deltaTime, input) {}
    draw() {}
}
