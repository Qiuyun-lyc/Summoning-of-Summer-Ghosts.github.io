// 工具函数：加载精灵图并将其分割成独立的帧
export function loadSpriteSheet(path, frameCount) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            const frameWidth = img.width / frameCount;
            const frameHeight = img.height;
            const frames = [];
            // 遍历每一帧
            for (let i = 0; i < frameCount; i++) {
                // 为每一帧创建一个离屏canvas
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const ctx = canvas.getContext('2d');
                // 将精灵图的对应部分绘制到这个离屏canvas上
                ctx.drawImage(img, i * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                frames.push(canvas);
            }
            // Promise成功，返回包含所有帧和尺寸的对象
            resolve({ frames, frameWidth, frameHeight });
        };
        img.onerror = () => reject(new Error(`加载精灵图失败: ${path}`));
    });
}

// 工具函数：加载单个图片
export function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`加载图片失败: ${path}`));
    });
}

// 工具函数：加载JSON文件
export function loadJSON(path) {
    // 使用fetch API获取文件
    return fetch(path)
        .then(response => {
            // 如果HTTP状态码不是2xx，则抛出错误
            if (!response.ok) {
                throw new Error(`加载JSON失败: ${path}, 状态: ${response.status}`);
            }
            // 解析响应体为JSON对象
            return response.json();
        });
}