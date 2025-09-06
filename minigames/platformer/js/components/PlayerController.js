import { MOVE_SPEED } from '../constants.js';
import { Physics } from './Physics.js';
import { Transform } from './Transform.js';
import { StateMachine } from './StateMachine.js';
import { SpriteRenderer } from './SpriteRenderer.js';
import { gameEvents } from '../core/EventBus.js';

export class PlayerController {
    init() {
        // 在 init 中，我们只获取对自身 GameObject 上的其他组件的引用。
        // 这是安全的，因为它们在 init 被调用时都已存在。
        this.physics = this.gameObject.getComponent(Physics);
        this.transform = this.gameObject.getComponent(Transform);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
    }

    update(deltaTime, input) {
        // 在 update 循环中，我们可以安全地访问 this.gameObject.scene，
        // 因为 update 只会在游戏对象被完全添加到场景后才开始被调用。
        
        // 1. 处理移动
        this._handleMovement(input);
        
        // 2. 更新状态机
        this.stateMachine.currentState.handleInput(input);
        
        // 3. 检查碰撞
        this._checkCollisions();
    }

    _handleMovement(input) {
        if (input.keys.ArrowLeft && !input.keys.ArrowRight) {
            this.physics.velocityX = -MOVE_SPEED;
            this.transform.facingRight = false;
        } else if (input.keys.ArrowRight && !input.keys.ArrowLeft) {
            this.physics.velocityX = MOVE_SPEED;
            this.transform.facingRight = true;
        } else {
            this.physics.velocityX = 0;
        }
    }

    _checkCollisions() {
        // 现在在这里调用是安全的，因为 this.gameObject.scene 已经有值了。
        const playerTransform = this.transform;
        const playerRenderer = this.gameObject.getComponent(SpriteRenderer);
        const { w: playerW, h: playerH } = playerRenderer.getDrawSize();

        for (const other of this.gameObject.scene.gameObjects) {
            if (other.name === 'LightOrb' && other.active) {
                const orbTransform = other.getComponent(Transform);
                const orbRenderer = other.getComponent(SpriteRenderer);
                const orbImage = orbRenderer.staticImage;

                const { w: orbW, h: orbH } = orbRenderer.getDrawSize(); // <--- 关键修改点

                // 使用获取到的缩放尺寸进行碰撞检测
                if (
                    playerTransform.x < orbTransform.x + orbW && // <--- 使用缩放后的宽度
                    playerTransform.x + playerW > orbTransform.x &&
                    playerTransform.y < orbTransform.y + orbH && // <--- 使用缩放后的高度
                    playerTransform.y + playerH > orbTransform.y
                ) {
                    
                    other.active = false;
                    gameEvents.emit('lightOrbCollected');
                }
            }
        }
    }
}