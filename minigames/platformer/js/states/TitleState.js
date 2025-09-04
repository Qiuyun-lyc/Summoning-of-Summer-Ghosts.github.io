import { BaseState } from './BaseState.js';

export class TitleState extends BaseState {
    enter() {
        console.log("进入标题状态");
    }

    update(deltaTime, input) {
        if (input.keys.Space) {
            this.manager.setState('PLAY', { level: 'level1.json' });
        }
    }

    draw() {
        //从game对象中获取渲染上下文和canvas
        const { ctx, canvas } = this.game;
        //绘制黑色背景
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //设置字体样式并绘制游戏标题
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Outsider: 交互式故事', canvas.width / 2, canvas.height / 3);
        //绘制“按键开始”的提示
        ctx.font = '24px sans-serif';
        ctx.fillText('按 空格键 开始', canvas.width / 2, canvas.height / 2);
    }
}