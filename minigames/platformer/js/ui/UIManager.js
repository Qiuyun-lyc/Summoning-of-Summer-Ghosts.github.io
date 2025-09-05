//引入全局事件总线
import { gameEvents } from '../core/EventBus.js';

//负责绘制所有用户界面元素
export class UIManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.playerHealth = { current: 100, max: 100 };
        this.lastAchievement = null; // 最近解锁的成就
        this.achievementTimer = 0; // 成就弹窗的显示计时器

        //订阅healthChanged事件，当玩家血量变化时更新内部状态
        gameEvents.on('healthChanged', (payload) => {
            if (payload.gameObject.name === 'Player') {
                this.playerHealth.current = payload.currentHealth;
                this.playerHealth.max = payload.maxHealth;
            }
        });
        // 订阅'achievementUnlocked'事件，用于显示成就弹窗
        gameEvents.on('achievementUnlocked', (achievement) => {
            this.lastAchievement = achievement;
            this.achievementTimer = 300; // 设置显示时长（约5秒，300帧）
        });
    }

    //主绘制函数，按顺序绘制所有UI元素
    draw() {
        this.drawPlayerHealthBar();
    }

    //绘制玩家血条
    drawPlayerHealthBar() {
        const x = 20;
        const y = 20;
        const width = 200;
        const height = 20;
        const healthPercentage = this.playerHealth.current / this.playerHealth.max;
        //绘制血条背景
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x, y, width, height);
        //绘制当前血量
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x, y, width * healthPercentage, height);
        //绘制血条边框
        this.ctx.strokeStyle = 'black';
        this.ctx.strokeRect(x, y, width, height);
        // 绘制血量数值文本
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`HP: ${this.playerHealth.current} / ${this.playerHealth.max}`, x + 5, y + 15);
    }
        // 绘制成就解锁弹窗
    drawAchievementPopup() {
        if (this.achievementTimer > 0) {
            this.achievementTimer--;
            
            const boxWidth = 300;
            const boxHeight = 60;
            const x = (this.canvas.width - boxWidth) / 2;
            const y = 20;
            
            // 实现淡入淡出效果
            this.ctx.globalAlpha = Math.min(1, (300 - this.achievementTimer) / 60) * Math.min(1, this.achievementTimer / 60);

            // 绘制弹窗背景
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(x, y, boxWidth, boxHeight);
            
            // 绘制弹窗边框
            this.ctx.strokeStyle = '#FFD700'; // 金色
            this.ctx.strokeRect(x, y, boxWidth, boxHeight);
            
            // 绘制成就标题
            this.ctx.fillStyle = '#FFD700';
            this.ctx.font = 'bold 18px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`成就解锁: ${this.lastAchievement.title}`, this.canvas.width / 2, y + 25);
            
            // 绘制成就描述
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px sans-serif';
            this.ctx.fillText(this.lastAchievement.description, this.canvas.width / 2, y + 48);

            // 恢复全局透明度
            this.ctx.globalAlpha = 1.0;
        }
    }
}

