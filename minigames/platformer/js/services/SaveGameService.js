// 引入必要的组件类，以便从GameObject中获取它们
import { Transform } from "../components/Transform.js";
import { HealthComponent } from "../components/HealthComponent.js";

// 定义存储在localStorage中的键名
const SAVE_KEY = 'outsiderPlanBSaveGame';

// SaveGameService类提供静态方法来处理游戏的保存和加载
export class SaveGameService {
    
    // 保存游戏状态
    static saveGame(player, currentLevelName, achievementManager) {
        // 从玩家对象中获取需要保存的组件数据
        const transform = player.getComponent(Transform);
        const health = player.getComponent(HealthComponent);
        
        // 获取所有已解锁的成就ID
        const unlockedAchievements = Object.values(achievementManager.achievements)
            .filter(ach => ach.unlocked)
            .map(ach => ach.id);
            
        // 构建要保存的数据对象
        const saveData = {
            version: '1.0',
            saveDate: new Date().toISOString(), // 记录保存时间
            level: currentLevelName,
            player: {
                x: transform.x,
                y: transform.y,
                health: health.currentHealth,
            },
            achievements: unlockedAchievements,
            storyFlags: {}, // 为未来的故事标记系统预留位置
        };
        
        // 尝试将数据对象序列化为JSON字符串并存入localStorage
        try {
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log("游戏已保存!", saveData);
            return true;
        } catch (e) {
            console.error("保存游戏失败:", e);
            return false;
        }
    }
    
    // 加载游戏状态
    static loadGame() {
        try {
            const savedData = localStorage.getItem(SAVE_KEY);
            if (savedData) {
                console.log("游戏已加载!");
                // 解析JSON字符串并返回数据对象
                return JSON.parse(savedData);
            }
            return null; // 没有找到存档
        } catch (e) {
            console.error("加载游戏失败:", e);
            return null;
        }
    }
    
    // 检查是否存在存档
    static hasSaveData() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }
}