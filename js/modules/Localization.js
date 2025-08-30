export default class Localization {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    get(key) {
        if (!this.dataManager.languageData) return key;

        const keys = key.split('.');
        let current = this.dataManager.languageData;

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return key; // 如果未找到，则返回键本身
            }
        }
        return current;
    }
}