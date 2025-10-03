import { gameEvents } from '../core/EventBus.js';

export class UIManager {
    constructor(canvas, config, game) { 
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.game = game; 
        this.playerHealth = { current: 100, max: 100 };
        this.healthIcon = game.assetManager.getImage('health_mask');
        
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
        this.drawHealthOrbs();
        this.drawOrbCounter();
        this.drawTimer();
        this.drawControlsHint();
    }

    drawHealthOrbs() {
        if (!this.healthIcon) return;

        const healthPerOrb = 20; 
        const numOrbs = Math.ceil(this.playerHealth.max / healthPerOrb);
        const orbSize = 50;
        const padding = 12;
        const startX = 20;
        const startY = 20;

        for (let i = 0; i < numOrbs; i++) {
            this.ctx.save();
            
            if (this.playerHealth.current <= i * healthPerOrb) {
                 this.ctx.globalAlpha = 0.3;
            } else {
                 this.ctx.globalAlpha = 1.0;
            }

            const x = startX + i * (orbSize + padding);
            
            this.ctx.shadowColor = 'black';
            this.ctx.shadowBlur = 8;
            this.ctx.shadowOffsetX = 2;
            this.ctx.shadowOffsetY = 2;

            this.ctx.drawImage(this.healthIcon, x, startY, orbSize, orbSize);

            this.ctx.restore();
        }
    }

    drawOrbCounter() {
        const x = this.canvas.width - 20;
        const y = 30;
        
        this.ctx.fillStyle = 'white'; 
        this.ctx.font = "bold 28px 'Courier New', serif"; 
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        this.ctx.shadowColor = '#FFD700'; 
        this.ctx.shadowBlur = 8; 
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(`光芒: ${this.collectedOrbs} / ${this.totalOrbs}`, x, y);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    drawTimer() {
        const secondsLeft = Math.max(0, Math.ceil(this.game.levelTimer / 1000));
        
        const x = this.canvas.width / 2;
        const y = 30;

        this.ctx.fillStyle = secondsLeft <= 10 ? '#bd504fff' : 'white';
        this.ctx.font = "bold 28px 'Courier New', serif";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(`时间: ${secondsLeft}`, x, y);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }

    drawControlsHint() {
        const hintText = "A / D : 移动  |  W : 跳跃";
        
        const x = this.canvas.width / 2;
        const y = this.canvas.height - 30;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = "18px 'Courier New', monospace";
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 4;
        
        this.ctx.fillText(hintText, x, y);

        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
}