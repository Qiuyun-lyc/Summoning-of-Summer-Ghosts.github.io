//引入实体工厂和地图类
import { createPlayer } from '../game/PlayerFactory.js';
import Tilemap from '../game/Tilemap.js';
import { createLightOrb } from '../game/EnemyFactory.js';

//代表一个游戏关卡或场景，是所有游戏实体的容器
export class Scene {
    constructor(mapFileName, assetManager) {
        this.assetManager = assetManager;
        this.gameObjects = [];
        this.player = null;
        this.tilemap = null;
        this.mapFileName = mapFileName;
        this._initialize();
    }

    //初始化场景内容，加载地图，创建玩家和实体
    _initialize() {
        const mapData = this.assetManager.getJson(this.mapFileName);
        
        const tilesetSource = mapData.tilesets[0].source;
        
        const tilesetImageName = tilesetSource.split('/').pop().replace('.xml', '');
        const tilesetImg = this.assetManager.getImage(tilesetImageName);

        if (!tilesetImg) {
            console.error(`错误：在 AssetManager 中未找到名为 "${tilesetImageName}" 的图块集图片！`);
            return;
        }

        this.tilemap = new Tilemap(mapData, tilesetImg);

        this.player = createPlayer(this.assetManager);
        this.addGameObject(this.player);
        
        this._loadObjectsFromMap(mapData);
    }

    // 从地图对象层加载实体
    _loadObjectsFromMap(mapData) {
        const objectLayers = mapData.layers.filter(layer => layer.type === 'objectgroup');
        for (const layer of objectLayers) {
            // 我们假设包含光芒的对象层名为 'Collectibles'
            if (layer.name === 'Collectibles') {
                for (const object of layer.objects) {
                     // 检查对象类型，确保只创建 light_orb
                    const typeProperty = object.properties?.find(p => p.name === 'type');
                    if (typeProperty && typeProperty.value === 'light_orb') {
                        const orb = createLightOrb(this.assetManager, object.x, object.y);
                        this.addGameObject(orb);
                    }
                }
            }
        }
    }


    //将一个GameObject添加到场景中
    addGameObject(gameObject) {
        gameObject.scene = this;
        this.gameObjects.push(gameObject);
    }

    //更新场景逻辑，遍历并更新场景中所有的GameObject
    update(deltaTime, input) {
        for (const gameObject of this.gameObjects) {
            if(gameObject.active) {
                gameObject.update(deltaTime, input);
            }
        }
    }
}