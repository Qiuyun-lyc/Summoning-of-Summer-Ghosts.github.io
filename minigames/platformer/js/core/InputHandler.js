export class InputHandler {
    constructor() {
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            Attack: false,
        };
        // 保存事件处理函数的引用，以便之后移除
        this._boundKeyDown = this._handleKeyDown.bind(this);
        this._boundKeyUp = this._handleKeyUp.bind(this);

        window.addEventListener('keydown', this._boundKeyDown);
        window.addEventListener('keyup', this._boundKeyUp);
    }
    
    // 将事件处理逻辑移到单独的方法中
    _handleKeyDown(e) {
        if (e.repeat) return;
        this._setKey(e.code, true);
    }

    _handleKeyUp(e) {
        this._setKey(e.code, false);
    }

    _setKey(code, value) {
        switch (code) {
            case 'ArrowLeft': this.keys.ArrowLeft = value; break;
            case 'ArrowRight': this.keys.ArrowRight = value; break;
            case 'Space': this.keys.Space = value; break;
            case 'KeyX': this.keys.Attack = value; break;
        }
    }

    consumeActionKeys() {
        this.keys.Space = false;
        this.keys.Attack = false;
    }
    
    // 新增：销毁方法，用于清理
    destroy() {
        window.removeEventListener('keydown', this._boundKeyDown);
        window.removeEventListener('keyup', this._boundKeyUp);
    }
}