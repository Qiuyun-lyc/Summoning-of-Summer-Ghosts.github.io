import { Transform } from './Transform.js';
import { Physics } from './Physics.js';
import { Animator } from './Animator.js';
import { HealthComponent } from './HealthComponent.js';

const states = {
    PATROL: 0,
    TURN: 1,
    DEATH: 2,
};

export class EnemyAIController {
    constructor(config) {
        this.speed = config.speed || 1;
        this.patrolDistance = config.patrolDistance || 100;
        this.startPatrolX = 0;
        this.patrolEndX = 0;
        this.direction = -1;
        
        this.state = states.PATROL;
    }

    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.physics = this.gameObject.getComponent(Physics);
        this.animator = this.gameObject.getComponent(Animator);
        this.health = this.gameObject.getComponent(HealthComponent);
        this.startPatrolX = this.transform.x - this.patrolDistance / 2;
        this.patrolEndX = this.transform.x + this.patrolDistance / 2;
        this.transform.facingRight = false;
    }

    update(deltaTime) {
        if (this.state === states.DEATH) {
            this.deathUpdate();
            return;
        }
        if (this.health.currentHealth <= 0) {
            this.state = states.DEATH;
            this.physics.velocityX = 0;
            this.physics.gravity = 0;
            this.animator.play('death');
            return;
        }

        switch(this.state) {
            case states.PATROL:
                this.patrolUpdate();
                break;
            case states.TURN:
                this.turnUpdate();
                break;
        }
    }
    
    patrolUpdate() {
        this.animator.play('walk');
        this.physics.velocityX = this.speed * this.direction;
        
        if (this.direction === 1 && this.transform.x >= this.patrolEndX) {
            this.transform.x = this.patrolEndX;
            this.physics.velocityX = 0;
            this.state = states.TURN;
            this.animator.play('turn');
        } 
        else if (this.direction === -1 && this.transform.x <= this.startPatrolX) {
            this.transform.x = this.startPatrolX;
            this.physics.velocityX = 0;
            this.state = states.TURN;
            this.animator.play('turn');
        }
    }

    turnUpdate() {
        if (this.animator.isAnimationFinished()) {
            this.direction *= -1;
            this.transform.facingRight = !this.transform.facingRight;
            this.state = states.PATROL;
        }
    }

    deathUpdate() {
        if (this.animator.isAnimationFinished()) {
            this.gameObject.active = false;
        }
    }
}