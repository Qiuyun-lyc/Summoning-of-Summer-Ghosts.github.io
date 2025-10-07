import { GRAVITY } from '../constants.js';
import { Transform } from './Transform.js';
import { SpriteRenderer } from './SpriteRenderer.js';

export class Physics {
    constructor(config = {}) {
        this.velocityX = 0;
        this.velocityY = 0;
        this.gravity = config.gravity ?? GRAVITY;
        this.floatAmplitude = 0;
        this.floatSpeed = 0;
        this._baseY = 0;
        this._floatTimer = 0;
    }

    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.renderer = this.gameObject.getComponent(SpriteRenderer);
        this._baseY = this.transform.y;
    }

    update(deltaTime) {
        if (this.floatAmplitude > 0) {
            this._floatTimer += this.floatSpeed;
            const offsetY = Math.sin(this._floatTimer) * this.floatAmplitude;
            this.transform.y = this._baseY + offsetY;
        }

        this.velocityY += this.gravity;
        this.transform.x += this.velocityX;
        if (this.gravity !== 0) {
            this.transform.y += this.velocityY;
        }
        
        if (this.gravity !== 0) {
            this.handleCollisions();
        }
    }
    
    handleCollisions() {
        const tilemap = this.gameObject.scene?.tilemap;
        if (!tilemap || !this.renderer) return;
        
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