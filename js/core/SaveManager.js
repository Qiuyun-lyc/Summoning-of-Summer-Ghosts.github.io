class User {
    constructor(username, password, userData = {}) {
        this.username = username;
        this.password = password;
        this.saveArray = userData.saveArray || new Array(10).fill(null);
        this.achievementArray = userData.achievementArray || [];
    }
}

class Save {
    constructor(saveData = {}) {
        this.saveDate = saveData.saveDate || new Date().toISOString();
        this.nodeId = saveData.nodeId || 101; // 初始节点
        this.LoveValue = saveData.LoveValue || 0;
        this.choices = saveData.choices || {}; // 使用对象存储选择历史
        
        // 新增：对话历史记录数组
        this.dialogueHistory = saveData.dialogueHistory || []; 
    }
}

export default class SaveManager {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
    }

    loadCurrentUser() {
        const username = sessionStorage.getItem('loginUser');
        if (username) {
            const userData = JSON.parse(localStorage.getItem(username));
            if (userData) {
                this.currentUser = new User(username, userData.password, userData);
            }
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    login(username, password) {
        const userData = JSON.parse(localStorage.getItem(username));
        if (userData && userData.password === password) {
            sessionStorage.setItem('loginUser', username);
            this.loadCurrentUser();
            return true;
        }
        return false;
    }

    register(username, password) {
        if (localStorage.getItem(username)) {
            return false;
        }
        const newUser = new User(username, password);
        localStorage.setItem(username, JSON.stringify(newUser));
        return true;
    }
    
    logout() {
        sessionStorage.removeItem('loginUser');
        this.currentUser = null;
    }

    createNewSave() {
        return new Save();
    }

    saveGame(slotIndex, saveData) {
        if (!this.currentUser || slotIndex < 0 || slotIndex >= this.currentUser.saveArray.length) {
            return false;
        }
        // 关键修复：创建一个saveData的深拷贝，以断开与gameState.currentSave的引用
        const saveCopy = JSON.parse(JSON.stringify(saveData));
        
        saveCopy.saveDate = new Date().toLocaleString('zh-CN');
        this.currentUser.saveArray[slotIndex] = saveCopy;
        
        this.persistCurrentUser();
        return true;
    }

    loadGame(slotIndex) {
        if (!this.currentUser || !this.currentUser.saveArray[slotIndex]) {
            return null;
        }
        return new Save(this.currentUser.saveArray[slotIndex]);
    }
    
    persistCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem(this.currentUser.username, JSON.stringify(this.currentUser));
        }
    }

    unlockAchievement(achievementId) {
        if (!this.currentUser) return;
        
        if (!this.currentUser.achievementArray.includes(achievementId)) {
            this.currentUser.achievementArray.push(achievementId);
            this.persistCurrentUser();
            console.log(`成就已解锁: ${achievementId}`);

            // 创建一个自定义事件，并携带成就ID作为数据
            const event = new CustomEvent('achievementUnlocked', {
                detail: { achievementId: achievementId }
            });
            
            // 在全局的 window 对象上分派这个事件
            window.dispatchEvent(event);
        }
    }
}