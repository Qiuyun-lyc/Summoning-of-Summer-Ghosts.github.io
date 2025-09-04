export default class Animation {
    async play(animationName) {
        return new Promise(resolve => {
            const handler = this[animationName];
            if (typeof handler === 'function') {
                handler.call(this, resolve); // 确保 'this' 上下文正确
            } else {
                console.warn(`动画 "${animationName}" 未找到。`);
                resolve();
            }
        });
    }

    // 淡入淡出效果的辅助函数
    _fade(element, time, start, target, callback) {
        let currentOpacity = start;
        element.style.opacity = currentOpacity;
        const step = (target - start) / (time / 20);

        const interval = setInterval(() => {
            currentOpacity += step;
            element.style.opacity = currentOpacity;
            if ((step > 0 && currentOpacity >= target) || (step < 0 && currentOpacity <= target)) {
                clearInterval(interval);
                element.style.opacity = target;
                if (callback) callback();
            }
        }, 20);
    }
    
    // 创建和管理临时覆盖元素的辅助函数
    _fadeToggle(src, className, fadeInTime, pauseTime, fadeOutTime, callback) {
        const element = document.createElement('img');
        element.src = src;
        element.className = `animation-overlay ${className}`;
        document.body.appendChild(element);

        this._fade(element, fadeInTime, 0, 1, () => {
            setTimeout(() => {
                this._fade(element, fadeOutTime, 1, 0, () => {
                    document.body.removeChild(element);
                    if (callback) callback();
                });
            }, pauseTime);
        });
    }
    
    // 具体动画实现
    showTeamIcon(resolve) {
        this._fadeToggle('./assets/img/bgr/test.jpg', 'show-team-icon', 1000, 2000, 1000, resolve);
    }

    showTitleIcon(resolve) {
        this._fadeToggle('./assets/img/bgr/test.png', 'show-title-icon', 1000, 2000, 1000, resolve);
    }
    
    // *** 修改 fadeInBlack ***
    // 它现在只负责淡入黑屏，并保持黑色。它会留下一个ID，以便fadeOutBlack可以找到它。
    fadeInBlack(resolve) {
        // 检查是否已经存在一个黑屏遮罩，如果存在就先移除
        const existingOverlay = document.getElementById('black-overlay-transition');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const element = document.createElement('div');
        element.id = 'black-overlay-transition'; // 添加ID
        element.className = 'animation-overlay black-overlay';
        element.style.zIndex = '9999'; // 确保在最顶层
        document.body.appendChild(element);
        // 淡入时间缩短为600ms，让体验更流畅
        this._fade(element, 600, 0, 1, () => {
            if (resolve) resolve(); // 淡入完成后立即解析Promise
        });
    }

    // *** 修改 fadeOutBlack ***
    // 它现在负责找到由fadeInBlack创建的黑屏，并将其淡出后移除。
    fadeOutBlack(resolve) {
        const element = document.getElementById('black-overlay-transition');
        if (element) {
            // 淡出时间也缩短为600ms
            this._fade(element, 600, 1, 0, () => {
                document.body.removeChild(element);
                if (resolve) resolve();
            });
        } else {
            // 如果没有找到遮罩，也直接解析Promise
            console.warn("fadeOutBlack: 未找到黑屏遮罩。");
            if (resolve) resolve();
        }
    }

    shakeViewport(resolve) {
        const body = document.body;
        body.classList.add('shake-animation');
        setTimeout(() => {
            body.classList.remove('shake-animation');
            if (resolve) resolve();
        }, 500);
    }
    
    showGameOver(resolve) {
        this._fadeToggle('./assets/img/bgr/test.jpg', 'show-gameover', 2000, 3000, 2000, resolve);
    }
}