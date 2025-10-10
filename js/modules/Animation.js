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

    // 淡入淡出效果的辅助函数 (为旧动画保留)
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
    
    // 创建和管理临时覆盖元素的辅助函数 (为旧动画保留)
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
    
    // 使用 CSS Transitions
    fadeInBlack(resolve) {
        const existingOverlay = document.getElementById('black-overlay-transition');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const element = document.createElement('div');
        element.id = 'black-overlay-transition';
        element.className = 'animation-overlay black-overlay'; // 应用 CSS 类
        document.body.appendChild(element);

        // 监听过渡动画结束
        element.addEventListener('transitionend', resolve, { once: true });

        // 触发过渡
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { // 确保浏览器应用初始样式
                element.classList.add('visible');
            });
        });
    }

    // 使用 CSS Transitions 
    fadeOutBlack(resolve) {
        const element = document.getElementById('black-overlay-transition');
        
        if (element) {
             // 监听过渡动画结束
            element.addEventListener('transitionend', () => {
                element.remove();
                if (resolve) resolve();
            }, { once: true });

            // 触发淡出
            element.classList.remove('visible');

            // 添加安全超时
            setTimeout(() => {
                if (document.body.contains(element)) {
                    element.remove();
                    if (resolve) resolve(); // 确保 Promise 被解析
                }
            }, 1000); // 略长于动画时间
        } else {
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