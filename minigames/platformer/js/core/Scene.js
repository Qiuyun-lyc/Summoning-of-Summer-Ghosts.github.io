import { createPlayer } from '../game/PlayerFactory.js';
import Tilemap from '../game/Tilemap.js';
import { createLightOrb, createGarpede } from '../game/EnemyFactory.js';

export class Scene {
    constructor(mapFileName, assetManager) {
        this.assetManager = assetManager;
        this.gameObjects = [];
        this.player = null;
        this.tilemap = null;
        this.mapFileName = mapFileName;
        this._initialize();
    }

    _initialize() {
        const mapData = this.assetManager.getJson(this.mapFileName);
        this.tilemap = new Tilemap(mapData, this.assetManager);
        this.player = createPlayer(this.assetManager);
        this.addGameObject(this.player);
        this._loadObjectsFromMap(mapData);
    }

    _loadObjectsFromMap(mapData) {
        const objectLayers = mapData.layers.filter(layer => layer.type === 'objectgroup');
        for (const layer of objectLayers) {
            if (layer.name === 'Collectibles') {
                for (const object of layer.objects) {
                    const typeProperty = object.properties?.find(p => p.name === 'type');
                    if (typeProperty && typeProperty.value === 'light_orb') {
                        const orb = createLightOrb(this.assetManager, object.x, object.y);
                        this.addGameObject(orb);
                    }
                }
            }
            if (layer.name === 'Enemies') {
                for (const object of layer.objects) {
                    const typeProperty = object.properties?.find(p => p.name === 'type');
                    if (typeProperty && typeProperty.value === 'garpede') {
                        const enemy = createGarpede(this.assetManager, object.x, object.y);
                        this.addGameObject(enemy);
                    }
                }
            }
        }
    }

    addGameObject(gameObject) {
        gameObject.scene = this;
        this.gameObjects.push(gameObject);
    }

    update(deltaTime, input) {
        for (const gameObject of this.gameObjects) {
            if(gameObject.active) {
                gameObject.update(deltaTime, input);
            }
        }
    }
}