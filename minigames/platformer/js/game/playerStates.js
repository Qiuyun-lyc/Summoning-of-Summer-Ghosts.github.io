import { states, JUMP_POWER } from '../constants.js';
import { Physics } from '../components/Physics.js';
import { Animator } from '../components/Animator.js';
import { StateMachine } from '../components/StateMachine.js';
import { Transform } from '../components/Transform.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { HealthComponent } from '../components/HealthComponent.js';
import { EnemyAIController } from '../components/EnemyAIController.js';
import { gameEvents } from '../core/EventBus.js';

class PlayerState {
    constructor(state, gameObject) {
        this.state = state;
        this.gameObject = gameObject;
        this.physics = this.gameObject.getComponent(Physics);
        this.animator = this.gameObject.getComponent(Animator);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
    }
    enter() {}
    handleInput(input) {}
}

export class IdleState extends PlayerState {
    constructor(player) { super(states.IDLE, player); }
    enter() { this.animator.play('idle'); }
    handleInput(input) {
        if (!this.physics.isOnGround()) {
            this.stateMachine.setState(states.FALL);
        } else if (input.keys.Attack) {
            this.stateMachine.setState(states.ATTACK);
        } else if (input.keys.Space) {
            this.stateMachine.setState(states.JUMP);
        } else if ((input.keys.ArrowLeft || input.keys.ArrowRight) && !(input.keys.ArrowLeft && input.keys.ArrowRight)) {
            this.stateMachine.setState(states.WALK);
        }
    }
}

export class WalkState extends PlayerState {
    constructor(player) { super(states.WALK, player); }
    enter() { this.animator.play('walk'); }
    handleInput(input) {
        if (!this.physics.isOnGround()) {
            this.stateMachine.setState(states.FALL);
        } else if (input.keys.Attack) {
            this.stateMachine.setState(states.ATTACK);
        } else if (input.keys.Space) {
            this.stateMachine.setState(states.JUMP);
        } else if (!(input.keys.ArrowLeft || input.keys.ArrowRight) || (input.keys.ArrowLeft && input.keys.ArrowRight)) {
            this.stateMachine.setState(states.IDLE);
        }
    }
}

export class JumpState extends PlayerState {
    constructor(player) { super(states.JUMP, player); }
    enter() {
        if (this.physics.isOnGround()) {
            this.physics.velocityY = -JUMP_POWER;
            this.animator.play('jump');
        } else {
            this.stateMachine.setState(states.FALL);
        }
    }
    handleInput(input) {
        if (this.physics.velocityY >= 0) {
            this.stateMachine.setState(states.FALL);
        } else if (input.keys.Attack) {
            this.stateMachine.setState(states.ATTACK);
        }
    }
}

export class FallState extends PlayerState {
    constructor(player) { super(states.FALL, player); }
    enter() { this.animator.play('fall'); }
    handleInput(input) {
        if (this.physics.isOnGround()) {
            this.stateMachine.setState(states.LAND);
        } else if (input.keys.Attack) {
            this.stateMachine.setState(states.ATTACK);
        }
    }
}

export class LandState extends PlayerState {
    constructor(player) { super(states.LAND, player); }
    enter() { this.animator.play('land'); }
    handleInput(input) {
        if (this.animator.isAnimationFinished()) {
            if (input.keys.ArrowLeft || input.keys.ArrowRight) {
                this.stateMachine.setState(states.WALK);
            } else {
                this.stateMachine.setState(states.IDLE);
            }
        }
    }
}

export class AttackState extends PlayerState {
    constructor(player) { super(states.ATTACK, player); }
    enter() {
        this.animator.play('attack');
        this.physics.velocityX = 0;
        this.attacked = false; 
    }
    handleInput(input) {
        if(this.animator.currentFrameIndex === 3 && !this.attacked){
            this.checkForHit();
            this.attacked = true;
        }

        if (this.animator.isAnimationFinished()) {
            if (!this.physics.isOnGround()) {
                this.stateMachine.setState(states.FALL);
            } else if (input.keys.ArrowLeft || input.keys.ArrowRight) {
                this.stateMachine.setState(states.WALK);
            } else {
                this.stateMachine.setState(states.IDLE);
            }
        }
    }

     checkForHit() {
        const transform = this.gameObject.getComponent(Transform);
        const renderer = this.gameObject.getComponent(SpriteRenderer);
        const { w: playerW, h: playerH } = renderer.getDrawSize();
        
        const attackRange = 80;
        const attackHeight = 60;

        let hitboxX, hitboxY;
        hitboxY = transform.y + (playerH - attackHeight) / 2;
        const playerCenterX = transform.x + playerW / 2;

        if (transform.facingRight) {
            hitboxX = playerCenterX;
        } else {
            hitboxX = playerCenterX - attackRange;
        }
        
        for (const other of this.gameObject.scene.gameObjects) {
            if (other.name === 'Enemy' && other.active) {
                const enemyTransform = other.getComponent(Transform);
                const enemyRenderer = other.getComponent(SpriteRenderer);
                const { w: enemyW, h: enemyH } = enemyRenderer.getDrawSize();

                if (hitboxX < enemyTransform.x + enemyW &&
                    hitboxX + attackRange > enemyTransform.x &&
                    hitboxY < enemyTransform.y + enemyH &&
                    hitboxY + attackHeight > enemyTransform.y) {

                    console.log("击中敌人!");
                    gameEvents.emit('enemyHit'); 
                    const enemyHealth = other.getComponent(HealthComponent);
                    if (enemyHealth) {
                        enemyHealth.takeDamage(25);
                        
                        const aiController = other.getComponent(EnemyAIController);
                        if (aiController) {
                            const knockbackDirection = transform.facingRight ? 1 : -1;
                            aiController.onHit(knockbackDirection);
                        }
                    }
                }
            }
        }
    }
}