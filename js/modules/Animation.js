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
    
    fadeInBlack(resolve) {
        const element = document.createElement('div');
        element.className = 'animation-overlay black-overlay';
        document.body.appendChild(element);
        this._fade(element, 1200, 0, 1, () => {
            setTimeout(() => {
                document.body.removeChild(element);
                if (resolve) resolve();
            }, 500);
        });
    }

    fadeOutBlack(resolve) {
        const element = document.createElement('div');
        element.className = 'animation-overlay black-overlay';
        element.style.opacity = 1;
        document.body.appendChild(element);
        this._fade(element, 1200, 1, 0, () => {
            document.body.removeChild(element);
            if (resolve) resolve();
        });
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