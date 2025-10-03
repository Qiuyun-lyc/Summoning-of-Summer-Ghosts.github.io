import { MOVE_SPEED, states } from '../constants.js';
import { Physics } from './Physics.js';
import { Transform } from './Transform.js';
import { StateMachine } from './StateMachine.js';
import { SpriteRenderer } from './SpriteRenderer.js';
import { gameEvents } from '../core/EventBus.js';
import { HealthComponent } from './HealthComponent.js';

export class PlayerController {
    constructor() {
        this.invincibilityDuration = 1000;
        this.lastDamageTime = 0;
        this.isKnockedBack = false;
        this.knockbackFriction = 0.85;
    }

    init() {
        this.physics = this.gameObject.getComponent(Physics);
        this.transform = this.gameObject.getComponent(Transform);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
        this.health = this.gameObject.getComponent(HealthComponent);
    }

    update(deltaTime, input) {
        if (this.isKnockedBack) {
            this.physics.velocityX *= this.knockbackFriction;
            if (Math.abs(this.physics.velocityX) < 0.5) {
                this.isKnockedBack = false;
            }
        } else {
            this._handleMovement(input);
        }
        
        this.stateMachine.currentState.handleInput(input);
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
        const playerTransform = this.transform;
        const playerRenderer = this.gameObject.getComponent(SpriteRenderer);
        const { w: playerW, h: playerH } = playerRenderer.getDrawSize();

        for (const other of this.gameObject.scene.gameObjects) {
            if (!other.active) continue;

            if (other.name === 'LightOrb') {
                const orbTransform = other.getComponent(Transform);
                const { w: orbW, h: orbH } = other.getComponent(SpriteRenderer).getDrawSize();

                if (
                    playerTransform.x < orbTransform.x + orbW &&
                    playerTransform.x + playerW > orbTransform.x &&
                    playerTransform.y < orbTransform.y + orbH &&
                    playerTransform.y + playerH > orbTransform.y
                ) {
                    other.active = false;
                    gameEvents.emit('lightOrbCollected');
                }
            } else if (other.name === 'Enemy') {
                const now = Date.now();
                if (now - this.lastDamageTime < this.invincibilityDuration) {
                    continue;
                }

                const enemyTransform = other.getComponent(Transform);
                const { w: enemyW, h: enemyH } = other.getComponent(SpriteRenderer).getDrawSize();
                
                const currentState = this.stateMachine.currentState.state;
                const hitboxPaddingX = playerW * 0.3;

                const hitboxPaddingY = (currentState === states.JUMP || currentState === states.FALL)
                    ? playerH * 0.4 
                    : playerH * 0.1; 

                const playerHitbox = {
                    x: playerTransform.x + hitboxPaddingX,
                    y: playerTransform.y + hitboxPaddingY,
                    w: playerW - 2 * hitboxPaddingX,
                    h: playerH - 2 * hitboxPaddingY
                };

                const enemyHitbox = {
                    x: enemyTransform.x + hitboxPaddingX,
                    y: enemyTransform.y + hitboxPaddingY,
                    w: enemyW - 2 * hitboxPaddingX,
                    h: enemyH - 2 * hitboxPaddingY
                };

                if (
                    playerHitbox.x < enemyHitbox.x + enemyHitbox.w &&
                    playerHitbox.x + playerHitbox.w > enemyHitbox.x &&
                    playerHitbox.y < enemyHitbox.y + enemyHitbox.h &&
                    playerHitbox.y + playerHitbox.h > enemyHitbox.y
                ) {
                    console.log("玩家与敌人发生碰撞！");
                    this.health.takeDamage(10);
                    this.lastDamageTime = now;
                    this.isKnockedBack = true;

                    const knockbackDirection = playerTransform.x + playerW / 2 < enemyTransform.x + enemyW / 2 ? -1 : 1;
                    this.physics.velocityX = knockbackDirection * 5;
                    this.physics.velocityY = -4;
                }
            }
        }
    }
}