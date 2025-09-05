//实现全局的发布—订阅模式，用于模块间解耦通信
class EventBus {
    constructor() {
        //使用一个对象来储存所有事件的监听器回调函数
        this.listeners = {};
    }

    //订阅事件，注册一个回调函数到指定的事件名
    on(event, callback) {
        //若该事件还没有监听器，则创建一个空数组
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        //将回调函数添加到该事件的监听器数组中
        this.listeners[event].push(callback);
    }

    //取消订阅，从指定事件名中移除一个回调函数
    off(event, callback) {
        if (!this.listeners[event]) {
            return;
        }
        //过滤要移除的回调函数
        this.listeners[event] = this.listeners[event].filter(
            listener => listener !== callback
        );
    }

    //发布事件，触发一个事件，并执行所有订阅了该事件的回调函数
    emit(event, payload) {
        if (!this.listeners[event]) {
            return;
        }
        //遍历并执行该事件的所有回调函数，并将payload作为参数传入
        this.listeners[event].forEach(callback => {
            try {
                callback(payload);
            } catch (e) {
                console.error(`事件总线回调函数在处理事件 "${event}" 时出错:`, e);
            }
        });
    }
}

//创建一个全局唯一的EventBus实例并导出，供整个游戏使用
export const gameEvents = new EventBus();