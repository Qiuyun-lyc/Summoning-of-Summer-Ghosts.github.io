//纯数据组件，存储实体的位置和朝向
export class Transform {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        this.facingRight = true;
    }
}