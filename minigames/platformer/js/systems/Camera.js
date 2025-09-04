//负责管理游戏世界的窗口
export class Camera {
    constructor(viewportWidth, viewportHeight) {
        //摄像机在世界坐标系中的位置（视角中的左上角）
        this.x = 0;
        this.y = 0;
        //视口的尺寸
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
    }

    //根据目标（通常是玩家）和地图边界来更新摄像机位置
    update(target, tilemap) {
        if (!target) return;
        //设置一个死区，玩家在此区域内移动时摄像机不移动，以免频繁晃动
        const deadzoneX = this.viewportWidth / 4;
        const deadzoneY = this.viewportHeight / 4;

        //玩家超出右侧死区，则向右移动摄像头
        if (target.x > this.x + this.viewportWidth - deadzoneX) {
            this.x = target.x - (this.viewportWidth - deadzoneX);
        } else if (target.x < this.x + deadzoneX) {
            //如果玩家超出左侧死区，则向左移动摄像头
            this.x = target.x - deadzoneX;
        }

        //如果玩家超出下侧死区，则向下移动摄像机
        if (target.y > this.y + this.viewportHeight - deadzoneY) {
            this.y = target.y - (this.viewportHeight - deadzoneY);
        } else if (target.y < this.y + deadzoneY) {
            //如果玩家超出上侧死区，则向上移动摄像机
            this.y = target.y - deadzoneY;
        }

        //确保摄像机不会超出地图边界
        if (tilemap) {
            const mapWidthPixels = tilemap.mapWidth * tilemap.tileWidth;
            const mapHeightPixels = tilemap.mapHeight * tilemap.tileHeight;

            if (this.x < 0) this.x = 0;
            if (this.x > mapWidthPixels - this.viewportWidth) this.x = mapWidthPixels - this.viewportWidth;
            if (this.y < 0) this.y = 0;
            if (this.y > mapHeightPixels - this.viewportHeight) this.y = mapHeightPixels - this.viewportHeight;
        }
    }
}