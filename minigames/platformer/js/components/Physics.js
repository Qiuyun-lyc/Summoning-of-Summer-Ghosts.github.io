import { GRAVITY } from '../constants.js';
import { Transform } from './Transform.js';
import { SpriteRenderer } from './SpriteRenderer.js';

export class Physics {
    // 构造函数接收一个可选的配置对象
    constructor(config = {}) {
        this.velocityX = 0;
        this.velocityY = 0;
        // 如果配置中未提供gravity，则使用默认值
        this.gravity = config.gravity ?? GRAVITY;
        
        // 新增：用于浮动的属性
        this.floatAmplitude = 0; // 浮动振幅
        this.floatSpeed = 0;     // 浮动速度
        this._baseY = 0;         // 浮动的基准Y坐标
        this._floatTimer = 0;    // 浮动的计时器
    }

    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.renderer = this.gameObject.getComponent(SpriteRenderer);
        // 初始化浮动的基准Y坐标
        this._baseY = this.transform.y;
    }

    update(deltaTime) {
        // *** 核心修正：添加浮动逻辑 ***
        if (this.floatAmplitude > 0) {
            this._floatTimer += this.floatSpeed;
            // 使用正弦函数来计算平滑的上下浮动
            const offsetY = Math.sin(this._floatTimer) * this.floatAmplitude;
            this.transform.y = this._baseY + offsetY;
        }

        // 应用重力
        this.velocityY += this.gravity*deltaTime;
        
        // 根据速度更新位置
        this.transform.x += this.velocityX*deltaTime;
        // 如果有重力，才更新Y轴速度
        if (this.gravity !== 0) {
            this.transform.y += this.velocityY*deltaTime;
        }
        
        // 只对有重力的物体进行碰撞处理
        if (this.gravity !== 0) {
            this.handleCollisions();
        }
    }
    
    handleCollisions() {
        const tilemap = this.gameObject.scene?.tilemap;
        if (!tilemap || !this.renderer) return;
        
        // 只有动画实体需要计算drawSize
        const { w: drawW, h: drawH } = this.renderer.animator ? this.renderer.getDrawSize() : {w:0, h:0};
        
        if (this.velocityX > 0) {
            const rightSide = this.transform.x + drawW;
            const middleY = this.transform.y + drawH / 2;
            if (tilemap.isSolid(rightSide, middleY)) {
                this.transform.x = Math.floor(rightSide / tilemap.tileWidth) * tilemap.tileWidth - drawW - 1;
                this.velocityX = 0;
            }
        } else if (this.velocityX < 0) {
            const leftSide = this.transform.x;
            const middleY = this.transform.y + drawH / 2;
             if (tilemap.isSolid(leftSide, middleY)) {
                this.transform.x = (Math.floor(leftSide / tilemap.tileWidth) + 1) * tilemap.tileWidth + 1;
                this.velocityX = 0;
            }
        }

        if (this.velocityY > 0) { 
            const feetX = this.transform.x + drawW / 2;
            const feetY = this.transform.y + drawH;
            if (tilemap.isSolid(feetX, feetY)) {
                this.velocityY = 0;
                this.transform.y = Math.floor(feetY / tilemap.tileHeight) * tilemap.tileHeight - drawH;
            }
        }
    }
    
    isOnGround() {
        const tilemap = this.gameObject.scene?.tilemap;
        if (!tilemap || !this.renderer || !this.renderer.animator) return false;
        
        const { w: drawW, h: drawH } = this.renderer.getDrawSize();
        const feetX = this.transform.x + drawW / 2;
        const feetY = this.transform.y + drawH + 1; 
        return tilemap.isSolid(feetX, feetY);
    }
}