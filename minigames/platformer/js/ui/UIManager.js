//--- START OF FILE minigames/platformer/js/ui/UIManager.js ---
import { gameEvents } from '../core/EventBus.js';

export class UIManager {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.playerHealth = { current: 100, max: 100 };
        
        this.collectedOrbs = 0;
        this.totalOrbs = config.winCondition.value;

        gameEvents.on('healthChanged', (payload) => {
            if (payload.gameObject.name === 'Player') {
                this.playerHealth.current = payload.currentHealth;
                this.playerHealth.max = payload.maxHealth;
            }
        });

        gameEvents.on('lightOrbCollected', () => {
            this.collectedOrbs++;
        });
    }

    draw() {
        this.drawPlayerHealthBar();
        this.drawOrbCounter();
    }

    drawPlayerHealthBar() {
        const x = 20;
        const y = 20;
        const width = 200;
        const height = 20;
        const healthPercentage = this.playerHealth.current / this.playerHealth.max;
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, width * healthPercentage, height);
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`HP: ${this.playerHealth.current} / ${this.playerHealth.max}`, x + 5, y + 15);
    }

    drawOrbCounter() {
        const x = this.canvas.width - 20;
        const y = 30;
        
        this.ctx.fillStyle = '#FFD700'; // 使用金色来代表光芒
        this.ctx.font = 'bold 20px sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;
        
        this.ctx.fillText(`光芒: ${this.collectedOrbs} / ${this.totalOrbs}`, x, y);

        // 重置阴影，以免影响其他绘制
        this.ctx.shadowColor = 'transparent';
    }
}
//--- END OF FILE minigames/platformer/js/ui/UIManager.js ---