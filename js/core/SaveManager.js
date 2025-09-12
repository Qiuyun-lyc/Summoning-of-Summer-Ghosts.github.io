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
        this.nodeId = saveData.nodeId || 101; 
        this.LoveValue = saveData.LoveValue || 0;
        this.choices = saveData.choices || {}; 
        this.name = saveData.name || ''; 
        
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

    deleteSave(slotIndex) {
        if (!this.currentUser || slotIndex < 0 || slotIndex >= this.currentUser.saveArray.length) {
            return false;
        }

        this.currentUser.saveArray[slotIndex] = null;
        this.persistCurrentUser();
        return true;
    }

    saveGame(slotIndex, saveData, saveName) {
        if (!this.currentUser || slotIndex < 0 || slotIndex >= this.currentUser.saveArray.length) {
            return false;
        }
        const saveCopy = JSON.parse(JSON.stringify(saveData));
        
        saveCopy.saveDate = new Date().toLocaleString('zh-CN');
        saveCopy.name = saveName;
        this.currentUser.saveArray[slotIndex] = saveCopy;
        
        this.persistCurrentUser();
        return true;
    }

    loadGame(slotIndex) {
        if (!this.currentUser || !this.currentUser.saveArray[slotIndex]) {
            return null;
        }
        const saveDataCopy = JSON.parse(JSON.stringify(this.currentUser.saveArray[slotIndex]));
        return new Save(saveDataCopy);
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
            const event = new CustomEvent('achievementUnlocked', {
                detail: { achievementId: achievementId }
            });
            
            window.dispatchEvent(event);
        }
    }
}