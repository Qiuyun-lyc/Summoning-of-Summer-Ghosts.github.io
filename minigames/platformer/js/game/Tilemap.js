//负责解析从Tiled地图编辑器导出的JSON数据，并将其绘制到屏幕上
export default class Tilemap {
    constructor(mapData, assetManager) {
        this.mapData = mapData;
        this.tileWidth = mapData.tilewidth;
        this.tileHeight = mapData.tileheight;
        this.mapWidth = mapData.width;
        this.mapHeight = mapData.height;

        this.tilesets = []; // 创建一个数组来存储所有图块集信息
        for (const tsData of mapData.tilesets) {
            // 从 source 路径中提取文件名作为图像在 AssetManager 中的键名
            const imageName = tsData.source.split('/').pop().replace('.xml', '').replace('.tsx', '');
            const image = assetManager.getImage(imageName);
            
            if (image) {
                this.tilesets.push({
                    firstgid: tsData.firstgid,
                    image: image,
                    columns: Math.floor(image.width / this.tileWidth)
                });
            } else {
                console.error(`错误: 在 AssetManager 中未找到图块集图像 "${imageName}"`);
            }
        }

        // 按 firstgid 降序排序，这使得查找图块集变得非常高效
        this.tilesets.sort((a, b) => b.firstgid - a.firstgid);

        // 过滤出所有可见、需要绘制的图层块
        this.drawableLayers = this.mapData.layers.filter(
            layer => layer.type === 'tilelayer' && layer.visible
        );
        // 找到名为Collision的图层块，用于物理检测碰撞
        this.collisionLayer = this.mapData.layers.find(
            layer => layer.name.toLowerCase() === 'collision'
        );
    }

    //根据 gid 查找正确的图块集和坐标
    getTileInfo(gid) {
        if (!gid || gid === 0) return null;

        // 因为已经按 firstgid 降序排序，第一个匹配的就是正确的图块集
        for (const tileset of this.tilesets) {
            if (gid >= tileset.firstgid) {
                const localId = gid - tileset.firstgid;
                const sx = (localId % tileset.columns) * this.tileWidth;
                const sy = Math.floor(localId / tileset.columns) * this.tileHeight;
                return { image: tileset.image, sx, sy };
            }
        }
        return null; // 没有找到对应的图块集
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

                    const tileInfo = this.getTileInfo(gid);
                    if (!tileInfo) continue;
                    
                    //从正确的图块集图片中裁剪出对应图块，并绘制到canvas的指定位置
                    ctx.drawImage(
                        tileInfo.image,
                        tileInfo.sx, tileInfo.sy, this.tileWidth, this.tileHeight,
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