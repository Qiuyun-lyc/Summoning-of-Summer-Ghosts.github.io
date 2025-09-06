import { gameEvents } from '../core/EventBus.js';

export class UIManager {
    constructor(canvas, config, game) { // 在构造函数中接收 game 对象
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = config;
        this.game = game; // 保存 game 对象的引用
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
        //this.drawPlayerHealthBar();
        this.drawOrbCounter();
        this.drawTimer();
        this.drawControlsHint();
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
        // 从 game 对象获取剩余时间，并转换为秒
        const secondsLeft = Math.max(0, Math.ceil(this.game.levelTimer / 1000));
        
        // 将计时器放在屏幕顶部中央
        const x = this.canvas.width / 2;
        const y = 30;

        // 当时间紧张时，将颜色变为红色以警示玩家
        this.ctx.fillStyle = secondsLeft <= 10 ? '#bd504fff' : 'white';
        this.ctx.font = "bold 28px 'Courier New', serif";
        this.ctx.textAlign = 'center'; // 居中对齐
        this.ctx.textBaseline = 'middle';

        // 添加轻微的黑色阴影以增强可读性
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        this.ctx.fillText(`时间: ${secondsLeft}`, x, y);

        // 重置阴影属性，避免影响其他UI绘制
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
    drawControlsHint() {
        const hintText = "A / D : 移动  |  W : 跳跃";
        
        // 将提示放在屏幕底部中央
        const x = this.canvas.width / 2;
        const y = this.canvas.height - 30; // 距离底部30像素

        // 使用半透明的白色，使其不那么刺眼
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = "18px 'Courier New', monospace"; // 使用稍小一点的字体
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // 添加一个非常轻微的阴影以增加可读性
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 4;
        
        this.ctx.fillText(hintText, x, y);

        // 重置阴影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
    }
}