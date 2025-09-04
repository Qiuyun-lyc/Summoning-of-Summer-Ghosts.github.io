import { loadSpriteSheet, loadImage, loadJSON } from '../utils/loaders.js';

export class AssetManager {
    // 构造函数接收一个基础路径
    constructor(basePath = '') {
        this.basePath = basePath;
        this.images = new Map();
        this.jsons = new Map();
        this.spriteSheets = new Map();
    }

    async loadAll() {
        const bp = this.basePath; // base path shorthand
        const [
            idleData, walkData, jumpData, fallData, landData, attackData,
            slashImg, tilesetImg,
            mapLevel1Data, mapLevel2Data
        ] = await Promise.all([
            // 所有路径前都加上基础路径
            loadSpriteSheet(`${bp}assets/sprites/player/idle.png`, 9),
            loadSpriteSheet(`${bp}assets/sprites/player/walk.png`, 8),
            loadSpriteSheet(`${bp}assets/sprites/player/jump.png`, 9),
            loadSpriteSheet(`${bp}assets/sprites/player/fall.png`, 3),
            loadSpriteSheet(`${bp}assets/sprites/player/land.png`, 3),
            loadSpriteSheet(`${bp}assets/sprites/player/attack.png`, 5),
            loadImage(`${bp}assets/sprites/player/lr1.png`),
            loadImage(`${bp}assets/sprites/tileset.png`),
            loadJSON(`${bp}assets/maps/level1.json`),
            loadJSON(`${bp}assets/maps/level2.json`),
        ]);

        this.spriteSheets.set('idle', idleData);
        this.spriteSheets.set('walk', walkData);
        this.spriteSheets.set('jump', jumpData);
        this.spriteSheets.set('fall', fallData);
        this.spriteSheets.set('land', landData);
        this.spriteSheets.set('attack', attackData);

        this.images.set('slash', slashImg);
        this.images.set('tileset', tilesetImg);

        this.jsons.set('level1.json', mapLevel1Data);
        this.jsons.set('level2.json', mapLevel2Data);
    }

    getSpriteSheet(name) { return this.spriteSheets.get(name); }
    getImage(name) { return this.images.get(name); }
    getJson(name) { return this.jsons.get(name); }
}