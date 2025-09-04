import { TARGET_H } from '../constants.js';
import { Transform } from './Transform.js';
import { Animator } from './Animator.js';
import { StateMachine } from './StateMachine.js';

//负责将实体动画帧绘制到屏幕上
export class SpriteRenderer {
    constructor(slashFrame) {
        this.slashFrame = slashFrame;
    }

    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.animator = this.gameObject.getComponent(Animator);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
    }

    //计算精灵在屏幕上应该绘制的尺寸（基于缩放）
    getDrawSize() {
        const size = this.animator.getFrameSize();
        if (size.h === 0) return { w: 0, h: 0 };
        const scale = TARGET_H / size.h;
        return { w: size.w * scale, h: size.h * scale };
    }

    //绘制方法
    draw(ctx) {
        const frameCanvas = this.animator.getCurrentFrame();
        if (!frameCanvas) return;

        const { w: drawW, h: drawH } = this.getDrawSize();

        ctx.save();
        //根据朝向翻转精灵
        if (this.transform.facingRight) { 
            ctx.translate(this.transform.x + drawW, this.transform.y);
            ctx.scale(-1, 1);
            ctx.drawImage(frameCanvas, 0, 0, drawW, drawH);
        } else {
            ctx.drawImage(frameCanvas, this.transform.x, this.transform.y, drawW, drawH);
        }
        
        ctx.restore();
        //如果有攻击特效，则绘制它
        this._drawSlash(ctx, drawW, drawH);
    }
    
    //绘制攻击特效
    _drawSlash(ctx, playerW, playerH) {
        if (this.stateMachine && this.stateMachine.currentState.state === 'ATTACK') {
            const slashW = this.slashFrame.width;
            const slashH = this.slashFrame.height;
            const scale = playerH / slashH;
            const newW = slashW * scale;
            const newH = playerH;
            
            const offsetY = 0.5;
            const offsetX = 0.8;
            
            let slashX, slashY;
            
            ctx.save();
            if (this.transform.facingRight) { //朝右
                slashX = this.transform.x + playerW * (1 - offsetX);
                slashY = this.transform.y + playerH * offsetY;
                ctx.translate(slashX + newW, slashY);
                ctx.scale(-1, 1);
                ctx.drawImage(this.slashFrame, 0, 0, newW, newH);
            } else {//朝左
                slashX = this.transform.x + playerW * offsetX - newW;
                slashY = this.transform.y + playerH * offsetY;
                ctx.drawImage(this.slashFrame, slashX, slashY, newW, newH);
            }
            ctx.restore();
        }
    }
}