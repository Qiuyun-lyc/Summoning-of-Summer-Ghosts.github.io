//引入实体工厂和地图类
import { createPlayer } from '../game/PlayerFactory.js';
import Tilemap from '../game/Tilemap.js';
import { createSlime } from '../game/EnemyFactory.js';

//代表一个游戏关卡或场景，是所有游戏实体的容器
export class Scene {
    constructor(mapFileName, assetManager) {
        this.assetManager = assetManager;//引用资源管理器
        this.gameObjects = [];           //存储场景中所有的GameObject
        this.player = null;              //对玩家的引用
        this.tilemap = null;             //场景的瓦片地图
        this.mapFileName = mapFileName;  //当前场景加载的地图文件名
        //初始化场景
        this._initialize();
    }

    //初始化场景内容，加载地图，创建玩家和敌人
    _initialize() {
        //从资源管理器获取地图数据和图块资源
        const mapData = this.assetManager.getJson(this.mapFileName);
        const tilesetImg = this.assetManager.getImage('tileset');
        //创建地图实例
        this.tilemap = new Tilemap(mapData, tilesetImg);
        //使用工厂地图创建玩家和敌人
        this.player = createPlayer(this.assetManager);
        const slime = createSlime(this.assetManager, 400, 100);
        //将创建的实体添加到场景中
        this.addGameObject(slime);
        this.addGameObject(this.player);
    }

    //将一个GameObject添加到场景中
    addGameObject(gameObject) {
        gameObject.scene = this;//在实体中保留对场景的引用
        this.gameObjects.push(gameObject);
    }

    //更新场景逻辑，遍历并更新场景中所有的GameObject
    update(deltaTime, input) {
        for (const gameObject of this.gameObjects) {
            gameObject.update(deltaTime, input);
        }
    }
}