import { TARGET_H, states} from '../constants.js';
import { Transform } from './Transform.js';
import { Animator } from './Animator.js';
import { StateMachine } from './StateMachine.js';

export class SpriteRenderer {
    constructor(slashFrame) {
        this.slashFrame = slashFrame;
        this.isStatic = false;
        this.staticImage = null;
    }

    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.animator = this.gameObject.getComponent(Animator);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
    }

    getDrawSize() {
        if (this.isStatic && this.staticImage) {
            // 定义光芒的目标高度为主角的一半
            const targetHeight = TARGET_H / 2; 
            if (this.staticImage.height === 0) return { w: 0, h: 0 };
            
            // 计算缩放比例
            const scale = targetHeight / this.staticImage.height;
            // 根据比例计算新的宽度
            const targetWidth = this.staticImage.width * scale;
            
            return { w: targetWidth, h: targetHeight };
        }
        
        if (this.animator) {
            const size = this.animator.getFrameSize();
            if (size.h === 0) return { w: 0, h: 0 };
            const scale = TARGET_H / size.h;
            return { w: size.w * scale, h: size.h * scale };
        }
        return { w: 0, h: 0 };
    }

    draw(ctx) {
        if (this.isStatic && this.staticImage) {
            const { w: drawW, h: drawH } = this.getDrawSize();
            ctx.drawImage(this.staticImage, this.transform.x, this.transform.y, drawW, drawH);
            return;
        }

        if (!this.animator) return;
        const frameCanvas = this.animator.getCurrentFrame();
        if (!frameCanvas) return;

        const { w: drawW, h: drawH } = this.getDrawSize();

        ctx.save();
        if (this.transform.facingRight) { 
            ctx.translate(this.transform.x + drawW, this.transform.y);
            ctx.scale(-1, 1);
            ctx.drawImage(frameCanvas, 0, 0, drawW, drawH);
        } else {
            ctx.drawImage(frameCanvas, this.transform.x, this.transform.y, drawW, drawH);
        }
        
        ctx.restore();
        this._drawSlash(ctx, drawW, drawH);
    }
    
    _drawSlash(ctx, playerW, playerH) {
        if (this.stateMachine && this.stateMachine.currentState.state === states.ATTACK) {
            const slashW = this.slashFrame.width;
            const slashH = this.slashFrame.height;
            const scale = playerH / slashH;
            const newW = slashW * scale;
            const newH = playerH;
            
            const offsetY = 0.2;
            const offsetX = 0.3;
            
            let slashX, slashY;
            
            ctx.save();
            if (this.transform.facingRight) { 
                slashX = this.transform.x + playerW * (1 - offsetX);
                slashY = this.transform.y + playerH * offsetY;
                ctx.translate(slashX + newW, slashY);
                ctx.scale(-1, 1);
                ctx.drawImage(this.slashFrame, 0, 0, newW, newH);
            } else {
                slashX = this.transform.x + playerW * offsetX - newW;
                slashY = this.transform.y + playerH * offsetY;
                ctx.drawImage(this.slashFrame, slashX, slashY, newW, newH);
            }
            ctx.restore();
        }
    }
}
