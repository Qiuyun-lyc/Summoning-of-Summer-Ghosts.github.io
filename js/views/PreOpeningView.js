const PreOpeningView = {
    render: (container, engine, params) => {
        container.innerHTML = `
            <style>
                .pre-opening-view {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    background-color: #000;
                    overflow: hidden;
                }
                .pre-opening-view video {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* 视频铺满屏幕，可能会有裁剪 */
                }
            </style>
            <div class="view pre-opening-view">
                <video id="pre-opening-video-1" src="./assets/video/intro_1.mp4" autoplay></video>
                <video id="pre-opening-video-2" src="./assets/video/intro_2.mp4" loop style="display: none; cursor: pointer;"></video>
                <video id="pre-opening-video-3" src="./assets/video/intro_3.mp4" style="display: none;"></video>
            </div>
        `;
    },

    attachEventListeners: (container, engine, params) => {
        const video1 = document.getElementById('pre-opening-video-1');
        const video2 = document.getElementById('pre-opening-video-2');
        const video3 = document.getElementById('pre-opening-video-3');
        const viewContainer = container.querySelector('.pre-opening-view');
        const newGameSave = params.newGameSave;

        // 停止可能在播放的BGM
        engine.audioManager.stopBgm();

        // 错误处理，直接跳到游戏开场
        const handleError = (e) => {
            console.error("元神引入视频播放失败，直接跳至游戏开场:", e);
            engine.showView('Opening', { newGameSave: newGameSave });
        };

        // 监听视频1播放结束
        video1.addEventListener('ended', () => {
            video1.style.display = 'none';
            video2.style.display = 'block';
            video2.play().catch(handleError); // 确保循环视频开始播放

            // 只有在视频2开始显示后，才绑定用于跳转的点击事件
            viewContainer.addEventListener('click', () => {
                if (video2.style.display === 'block') {
                    video2.style.display = 'none';
                    video3.style.display = 'block';
                    video3.play().catch(handleError); // 播放开门视频
                }
            }, { once: true });
            
        }, { once: true });

        // 监听视频3播放结束
        video3.addEventListener('ended', () => {
            // 跳转开场动画
            engine.showView('Opening', { newGameSave: newGameSave });
        }, { once: true });

        // 错误监听
        video1.addEventListener('error', handleError, { once: true });
        video2.addEventListener('error', handleError, { once: true });
        video3.addEventListener('error', handleError, { once: true });
        
        // 尝试播放第一个视频，处理浏览器可能阻止自动播放的情况
        video1.play().catch(error => {
            console.warn("视频自动播放被浏览器阻止:", error);
            // 防止重复添加
            if (!container.querySelector('.autoplay-prompt')) {
                container.innerHTML += `<div class="autoplay-prompt" style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:1.5em; z-index:10; text-shadow: 2px 2px 4px #000; cursor: pointer;">点击屏幕开始</div>`;
            }
            
            // 独立的事件监听器
            const promptHandler = () => {
                const promptElement = container.querySelector('.autoplay-prompt');
                if (promptElement) {
                    promptElement.remove();
                }
                // 点击后允许播放声音
                video1.play().catch(handleError);
                viewContainer.removeEventListener('click', promptHandler);
            };
            viewContainer.addEventListener('click', promptHandler);
        });
    }
};

export default PreOpeningView;