export default class DataManager {
    constructor() {
        this.story = null;
        this.languageData = null;
        this.achievements = null; 
    }

    async loadAllData() {
        try {
            const [storyResponse, langResponse, achievementsResponse] = await Promise.all([
                fetch('./data/story.json'),
                fetch('./data/lang/zh-cn.json'), 
                fetch('./data/achievements.json')
            ]);
            this.story = await storyResponse.json();
            this.languageData = await langResponse.json();
            this.achievements = await achievementsResponse.json();
            console.log("所有游戏数据已成功加载。");
        } catch (error) {
            console.error("加载游戏数据失败:", error);
        }
    }

    getNode(nodeId) {
        if (!this.story || !this.story.nodes || !this.story.nodes[nodeId]) {
            console.error(`故事节点 ${nodeId} 未找到。`);
            return null;
        }
        const node = this.story.nodes[nodeId];
        if (node.inherit) {
            const baseNode = this.getNode(node.inherit);
            return { ...baseNode, ...node };
        }
        return node;
    }

    getAllAchievements() {
        return this.achievements ? this.achievements.achievements : [];
    }

    getLockedAchievementIcon() {
        return this.achievements ? this.achievements.lockedIcon : '';
    }
}