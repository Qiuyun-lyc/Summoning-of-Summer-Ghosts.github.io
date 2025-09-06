
import { loadSpriteSheet, loadImage, loadJSON } from '../utils/loaders.js';

function loadAudio(path) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.src = path;
        audio.oncanplaythrough = () => resolve(audio);
        audio.onerror = () => reject(new Error(`加载音频失败: ${path}`));
    });
}

export class AssetManager {
    constructor(basePath = '') {
        this.basePath = basePath;
        this.images = new Map();
        this.jsons = new Map();
        this.spriteSheets = new Map();
         this.audios = new Map();
    }

    async loadAudios() {
        const bp = this.basePath;
        const sfxNames = [
            'collect_0', 'collect_1', 'collect_2', 'collect_3', 
            'collect_4', 'collect_5', 'collect_6'
        ];
        
        const bgmName = 'rain_bgm';

        const sfxPromises = sfxNames.map(name => loadAudio(`${bp}assets/sfx/${name}.mp3`));
        const bgmPromise = loadAudio(`${bp}assets/audio/music/${bgmName}.mp3`);
        const allAudioPromises = [...sfxPromises, bgmPromise];

        const loadedAudios = await Promise.all(allAudioPromises);

        sfxNames.forEach((name, index) => {
            this.audios.set(name, loadedAudios[index]);
        });
        
        this.audios.set(bgmName, loadedAudios[sfxNames.length]);
    }

    async loadAll() {
        const bp = this.basePath;
        const [
            idleData, walkData, jumpData, fallData, landData, attackData,
            slashImg, tilesetImg, lightOrbImg,
            mapLevel1Data, mapLevel2Data
        ] = await Promise.all([
            loadSpriteSheet(`${bp}assets/sprites/player/idle.png`, 9),
            loadSpriteSheet(`${bp}assets/sprites/player/walk.png`, 8),
            loadSpriteSheet(`${bp}assets/sprites/player/jump.png`, 9),
            loadSpriteSheet(`${bp}assets/sprites/player/fall.png`, 3),
            loadSpriteSheet(`${bp}assets/sprites/player/land.png`, 3),
            loadSpriteSheet(`${bp}assets/sprites/player/attack.png`, 5),
            loadImage(`${bp}assets/sprites/player/lr1.png`),
            loadImage(`${bp}assets/sprites/tileset.png`),
            loadImage(`${bp}assets/sprites/light_orb.png`),
            loadJSON(`${bp}assets/maps/level1.json`),
            loadJSON(`${bp}assets/maps/level2.json`),
            this.loadAudios(),
        ]);

        this.spriteSheets.set('idle', idleData);
        this.spriteSheets.set('walk', walkData);
        this.spriteSheets.set('jump', jumpData);
        this.spriteSheets.set('fall', fallData);
        this.spriteSheets.set('land', landData);
        this.spriteSheets.set('attack', attackData);

        this.images.set('slash', slashImg);
        this.images.set('tileset', tilesetImg);
        this.images.set('light_orb', lightOrbImg);

        this.jsons.set('level1.json', mapLevel1Data);
        this.jsons.set('level2.json', mapLevel2Data);
    }

    getSpriteSheet(name) { return this.spriteSheets.get(name); }
    getImage(name) { return this.images.get(name); }
    getJson(name) { return this.jsons.get(name); }
    getAudio(name) { return this.audios.get(name); }
}