import { Camera } from './Camera.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { Transform } from '../components/Transform.js';

export class RendererSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = new Camera(this.canvas.width, this.canvas.height);

        this.raindrops = [];
        this.numRaindrops = 200;
        this.rainInitialized = false;
    }

    _initRainEffect(tilemap) {
        if (this.rainInitialized) return;

        const mapWidth = tilemap.mapWidth * tilemap.tileWidth;
        const mapHeight = tilemap.mapHeight * tilemap.tileHeight;

        for (let i = 0; i < this.numRaindrops; i++) {
            this.raindrops.push({
                x: Math.random() * mapWidth,
                y: Math.random() * mapHeight,
                length: Math.random() * 20 + 10, 
                speed: Math.random() * 5 + 4 
            });
        }
        this.rainInitialized = true;
    }

    _updateAndDrawRain(tilemap) {
        if (!tilemap) return;
        this._initRainEffect(tilemap);

        const mapWidth = tilemap.mapWidth * tilemap.tileWidth;
        
        this.ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();

        for (const drop of this.raindrops) {
            drop.y += drop.speed;
            
            if (drop.y > this.camera.y + this.camera.viewportHeight) {
                drop.y = this.camera.y - drop.length;
                drop.x = Math.random() * mapWidth; 
            }
            
            this.ctx.moveTo(drop.x, drop.y);
            this.ctx.lineTo(drop.x, drop.y + drop.length);
        }
        
        this.ctx.stroke();
    }

    handleResize(){
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.camera.viewportWidth = this.canvas.width;
        this.camera.viewportHeight = this.canvas.height;
    }

    render(scene) {
        const { tilemap, player } = scene;
        
        if (player) {
            const playerTransform = player.getComponent(Transform);
            this.camera.update(playerTransform, tilemap);
        }

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        if (tilemap) {
            tilemap.draw(this.ctx);
        }

        for (const gameObject of scene.gameObjects) {
            if (!gameObject.active) continue;
            const renderer = gameObject.getComponent(SpriteRenderer);
            if (renderer) {
                renderer.draw(this.ctx);
            }
        }
        
        this._updateAndDrawRain(tilemap);

        this.ctx.restore();
    }
}