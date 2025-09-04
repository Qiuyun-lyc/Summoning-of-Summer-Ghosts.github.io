import { GRAVITY } from '../constants.js';
import { Transform } from './Transform.js';
import { SpriteRenderer } from './SpriteRenderer.js';

//负责处理实体的物理行为
export class Physics {
    constructor() {
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = GRAVITY;
    }

    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.renderer = this.gameObject.getComponent(SpriteRenderer);
    }

    //每帧更新物理状态
    update(deltaTime) {
        //应用重力
        this.velocityY += this.gravity;
        //根据速度更新位置
        this.transform.x += this.velocityX;
        this.transform.y += this.velocityY;
        //处理碰撞
        this.handleCollisions();
    }
    
    //处理瓦片地图的碰撞
    handleCollisions() {
        const tilemap = this.gameObject.scene.tilemap;
        if (!tilemap) return;
        
        const { w: drawW, h: drawH } = this.renderer.getDrawSize();
        //水平碰撞检测
        if (this.velocityX > 0) {//向右
            const rightSide = this.transform.x + drawW;
            const middleY = this.transform.y + drawH / 2;
            if (tilemap.isSolid(rightSide, middleY)) {
                this.transform.x = Math.floor(rightSide / tilemap.tileWidth) * tilemap.tileWidth - drawW - 1;
                this.velocityX = 0;
            }
        } else if (this.velocityX < 0) {//向左
            const leftSide = this.transform.x;
            const middleY = this.transform.y + drawH / 2;
             if (tilemap.isSolid(leftSide, middleY)) {
                this.transform.x = (Math.floor(leftSide / tilemap.tileWidth) + 1) * tilemap.tileWidth + 1;
                this.velocityX = 0;
            }
        }

        //垂直碰撞检测
        if (this.velocityY > 0) { //向下
            const feetX = this.transform.x + drawW / 2;
            const feetY = this.transform.y + drawH;
            if (tilemap.isSolid(feetX, feetY)) {
                this.velocityY = 0;
                this.transform.y = Math.floor(feetY / tilemap.tileHeight) * tilemap.tileHeight - drawH;
            }
        }
    }
    
    //检查实体是否在地面上
    isOnGround() {
        const tilemap = this.gameObject.scene.tilemap;
        if (!tilemap) return false;
        
        const { w: drawW, h: drawH } = this.renderer.getDrawSize();
        const feetX = this.transform.x + drawW / 2;
        const feetY = this.transform.y + drawH + 1; 
        return tilemap.isSolid(feetX, feetY);
    }
}