//该类为游戏中所有实体的基类（玩家，敌人，道具）
export class GameObject {
    constructor(name = 'GameObject') {
        this.name = name;//实体名
        this.components = [];//储存实体组件
        this._componentMap = new Map();//通过类名快速查找组件
        this.scene = null;//对其所属场景的引用
        this.active = true;//实体是否活动（非活动状态将不更新不渲染)
    }

    //为实体添加一个组件
    addComponent(component) {
        component.gameObject = this;//组件中保存对父实体的引用
        this.components.push(component);
        this._componentMap.set(component.constructor, component);
        //如果组件有init方法，则初始化
        if (typeof component.init === 'function') {
            component.init();
        }
        return component;
    }

    //根据组件的类名获取组件实例
    getComponent(ComponentClass) {
        return this._componentMap.get(ComponentClass);
    }

    //更新实体的逻辑，它会遍历并调用所有组件的update方法
    update(deltaTime, input) {
        if (!this.active) return;
        for (const component of this.components) {
            if (typeof component.update === 'function') {
                component.update(deltaTime, input);
            }
        }
    }
}