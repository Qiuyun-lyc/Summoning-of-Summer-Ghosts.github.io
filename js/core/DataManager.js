export default class DataManager {
    constructor() {
        this.story = null;
        this.languageData = null;
    }

    async loadAllData() {
        try {
            const [storyResponse, langResponse] = await Promise.all([
                fetch('./data/story.json'),
                fetch('./data/lang/zh-cn.json') // 默认中文
            ]);
            this.story = await storyResponse.json();
            this.languageData = await langResponse.json();
            console.log("所有游戏数据已成功加载。");
        } catch (error) {
            console.error("加载游戏数据失败:", error);
        }
    }

getNode(nodeId) {
    // 检查 this.story 和 this.story.nodes 是否存在，以及 nodeId 是否在 nodes 中
    if (!this.story || !this.story.nodes || !this.story.nodes[nodeId]) {
        console.error(`故事节点 ${nodeId} 未找到。`);
        return null;
    }
    const node = this.story.nodes[nodeId];
    // 继承模型
    if (node.inherit) {
        const baseNode = this.getNode(node.inherit);
        return { ...baseNode, ...node };
    }
    return node;
}
}