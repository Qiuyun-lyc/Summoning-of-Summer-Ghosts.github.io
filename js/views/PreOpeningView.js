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
                <!-- 视频1: 门前 (自动播放一次) -->
                <video id="pre-opening-video-1" src="./assets/video/intro_1.mp4" autoplay></video>
                
                <!-- 视频2: 循环 (默认隐藏, 循环播放) -->
                <video id="pre-opening-video-2" src="./assets/video/intro_2.mp4" loop style="display: none; cursor: pointer;"></video>
                
                <!-- 视频3: 开门 (默认隐藏, 播放一次) -->
                <video id="pre-opening-video-3" src="./assets/video/intro_3.mp4" style="display: none;"></video>
            </div>
        `;
    },

    attachEventListeners: (container, engine, params) => {
        const video1 = document.getElementById('pre-opening-video-1');
        const video2 = document.getElementById('pre-opening-video-2');
        const video3 = document.getElementById('pre-opening-video-3');
        const viewContainer = container.querySelector('.pre-opening-view');

        // 从 GameEngine 传递过来的新游戏存档数据，必须保留并传递给下一个视图
        const newGameSave = params.newGameSave;

        // 停止可能在播放的BGM
        engine.audioManager.stopBgm();

        // 统一的错误处理函数，如果任何视频播放失败，直接跳到游戏开场
        const handleError = (e) => {
            console.error("元神引入视频播放失败，直接跳至游戏开场:", e);
            engine.showView('Opening', { newGameSave: newGameSave });
        };

        // --- 播放逻辑链 ---

        // 1. 监听视频1播放结束
        video1.addEventListener('ended', () => {
            video1.style.display = 'none';
            video2.style.display = 'block';
            video2.play().catch(handleError); // 确保循环视频开始播放
        }, { once: true });

        // 2. 监听视频2(或整个视图)的点击事件
        viewContainer.addEventListener('click', () => {
            // 确保只在视频2显示时点击才有效
            if (video2.style.display === 'block') {
                video2.style.display = 'none';
                video3.style.display = 'block';
                video3.play().catch(handleError); // 播放开门视频
            }
        }, { once: true }); // 使用 once 确保只触发一次

        // 3. 监听视频3播放结束
        video3.addEventListener('ended', () => {
            // 视频3播放完毕，跳转到原有的游戏开场动画
            engine.showView('Opening', { newGameSave: newGameSave });
        }, { once: true });

        // 为所有视频添加错误监听
        video1.addEventListener('error', handleError, { once: true });
        video2.addEventListener('error', handleError, { once: true });
        video3.addEventListener('error', handleError, { once: true });
        
        // 尝试播放第一个视频，处理浏览器可能阻止自动播放的情况
        video1.play().catch(error => {
            console.warn("视频自动播放被浏览器阻止:", error);
            // 如果第一个视频无法自动播放，我们可以提供一个点击提示
            container.innerHTML += `<div style="position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); color:white; font-size:1.5em; z-index:10; text-shadow: 2px 2px 4px #000;">点击屏幕开始</div>`;
            viewContainer.addEventListener('click', () => {
                // 用户点击后手动启动整个流程
                video1.play().catch(handleError);
            }, { once: true });
        });
    }
};

export default PreOpeningView;