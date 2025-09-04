import { gameEvents } from '../core/EventBus.js';

//负责管理实体的生命值
export class HealthComponent {
    constructor(maxHealth) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
    }

    init() {
    }
    
    //收到伤害
    takeDamage(amount) {
        if (this.currentHealth <= 0) return;

        this.currentHealth -= amount;
        if (this.currentHealth < 0) {
            this.currentHealth = 0;
        }
        //发布一个healthChanged事件，通知UI等系统更新
        gameEvents.emit('healthChanged', { 
            gameObject: this.gameObject, 
            currentHealth: this.currentHealth, 
            maxHealth: this.maxHealth 
        });
        //如果生命值为0，则死亡
        if (this.currentHealth === 0) {
            this.die();
        }
    }
    
    //恢复生命
    heal(amount) {
        this.currentHealth += amount;
        if (this.currentHealth > this.maxHealth) {
            this.currentHealth = this.maxHealth;
        }
        
        //发布一个healthChanged事件
        gameEvents.emit('healthChanged', { 
            gameObject: this.gameObject, 
            currentHealth: this.currentHealth, 
            maxHealth: this.maxHealth 
        });
    }

    //死亡逻辑
    die() {
        console.log(`${this.gameObject.name} 死亡了。`);
        gameEvents.emit('entityDied', { gameObject: this.gameObject });
    }

    update(deltaTime) {

    }
}