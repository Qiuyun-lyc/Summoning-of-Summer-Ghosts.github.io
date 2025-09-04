//引入全局事件总线
import { gameEvents } from '../core/EventBus.js';
//定义所有可能的成就
const achievements = {
    FIRST_BLOOD: {
        id: 'FIRST_BLOOD',
        title: '第一滴血',
        description: '击败你的第一个敌人。',
        unlocked: false,
    },
    NEAR_DEATH_EXPERIENCE: {
        id: 'NEAR_DEATH_EXPERIENCE',
        title: '死里逃生',
        description: '在生命值低于10%的情况下存活。',
        unlocked: false,
    }
};

//负责管理所有成就的逻辑
class AchievementManager {
    constructor() {
        //深拷贝成就对象，防止原始定义被意外修改
        this.achievements = { ...achievements };
        //订阅相关事件来检查成就解锁条件
        gameEvents.on('entityDied', this.onEntityDied.bind(this));
        gameEvents.on('healthChanged', this.onHealthChanged.bind(this));
    }
    
    //解锁第一个成就
    unlock(id) {
        const achievement = this.achievements[id];
        //如果成就存在且尚未解锁
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            console.log(`成就解锁: ${achievement.title}`);
            //发布achivementUnlocked事件，通知UI等系统
            gameEvents.emit('achievementUnlocked', achievement);
        }
    }
    
    //‘entitle'事件的回调函数
    onEntityDied(payload) {
        if (payload.gameObject.name === 'Enemy') {
            this.unlock('FIRST_BLOOD');//若死亡的是敌人，解锁’第一滴血‘
        }
    }
    
    //healthChanged事件的回调函数
    onHealthChanged(payload) {
        if (payload.gameObject.name === 'Player') {
            const healthPercentage = payload.currentHealth / payload.maxHealth;
            //若玩家血量在0到10%之间，解锁‘死里逃生’
            if (healthPercentage > 0 && healthPercentage < 0.1) {
                this.unlock('NEAR_DEATH_EXPERIENCE');
            }
        }
    }
    
}

//创建一个全局唯一的成就管理器实例并导出
export const achievementManager = new AchievementManager();