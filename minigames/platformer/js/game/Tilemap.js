//负责解析从Tiled地图编辑器导出的JSON数据，并将其绘制到屏幕上
export default class Tilemap {
    constructor(mapData, tilesetImg) {
        this.mapData = mapData;    //地图的JSON数据
        this.tileset = tilesetImg; //地图使用的图块资源图片
        //地图数据中读取基本信息
        this.tileWidth = mapData.tilewidth;
        this.tileHeight = mapData.tileheight;
        this.mapWidth = mapData.width;  //地图宽度（以图块为单位）
        this.mapHeight = mapData.height;//地图高度
        //获取图块集信息，用于计算每个图块在资源图片中的位置
        const ts0 = mapData.tilesets?.[0] ?? {};
        this.firstgid = ts0.firstgid ?? 1;
        this.columns = ts0.columns ?? Math.floor(this.tileset.width / this.tileWidth);//图块集每行有多少的图块
        //过滤出所有可见、需要绘制的图层块
        this.drawableLayers = this.mapData.layers.filter(
            layer => layer.type === 'tilelayer' && layer.visible
        );
        //找到名为Collision的图层块，用于物理检测碰撞
        this.collisionLayer = this.mapData.layers.find(
            layer => layer.name.toLowerCase() === 'collision'
        );
    }

    //根据图块的全局ID（gid）计算其在图块集图片中的坐标
    getTileCoords(gid) {
        if (!gid || gid < this.firstgid) return null;
        const id = gid - this.firstgid;
        const sx = (id % this.columns) * this.tileWidth;
        const sy = Math.floor(id / this.columns) * this.tileHeight;
        return { sx, sy };
    }

    //绘制整个地图
    draw(ctx) {
        //遍历所有可绘制图层
        for (const layer of this.drawableLayers) {
            if (layer.opacity < 1) {//处理图层透明度
                ctx.save();
                ctx.globalAlpha = layer.opacity;
            }
            //遍历图层中的每一个图块
            for (let r = 0; r < this.mapHeight; r++) {
                for (let c = 0; c < this.mapWidth; c++) {
                    const gid = layer.data[r * this.mapWidth + c] || 0;
                    if (gid === 0) continue;//表示该位置没有图块

                    const coords = this.getTileCoords(gid);
                    if (!coords) continue;
                    //从图块集图片中裁剪出对应图块，并绘制到canvas的指定位置
                    ctx.drawImage(
                        this.tileset,
                        coords.sx, coords.sy, this.tileWidth, this.tileHeight,
                        c * this.tileWidth, r * this.tileHeight, this.tileWidth, this.tileHeight
                    );
                }
            }

            if (layer.opacity < 1) {
                ctx.restore();
            }
        }
    }

    //根据世界坐标获取其所在位置的碰撞图块ID
    getTile(worldX, worldY) {
        const col = Math.floor(worldX / this.tileWidth);
        const row = Math.floor(worldY / this.tileHeight);

        if (col < 0 || col >= this.mapWidth || row < 0 || row >= this.mapHeight) return 0;
        if (!this.collisionLayer || !this.collisionLayer.data) return 0;

        return this.collisionLayer.data[row * this.mapWidth + col] || 0;
    }

    //检查世界坐标所在的位置是否为固体
    isSolid(worldX, worldY) {
        const tileId = this.getTile(worldX, worldY);
        //碰撞层中任何非0图块都被认为是固体
        return tileId !== 0;
    }
}