const EndingView = {
    render: (container, engine) => {
        container.innerHTML = `
            <style>
                .ending-view {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    background-color: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                #ending-video {
                    width: 100%;
                    height: 100%;
                    object-fit: contain; /* 保证视频完整显示，不变形 */
                }
                #skip-ending-btn {
                    position: absolute;
                    bottom: 30px;
                    right: 40px;
                    padding: 12px 28px;
                    font-size: 1.2em;
                    font-family: 'FangSong', '仿宋', sans-serif;
                    background-color: rgba(0, 0, 0, 0.6);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.7);
                    border-radius: 5px;
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.3s, background-color 0.3s;
                    z-index: 10;
                }
                #skip-ending-btn:hover {
                    opacity: 1;
                    background-color: rgba(255, 255, 255, 0.2);
                }
            </style>
            <div class="view ending-view">
                <video id="ending-video" src="./assets/video/ending.mov" autoplay></video>
                <button id="skip-ending-btn">跳过片尾</button>
            </div>
        `;
    },

    attachEventListeners: (container, engine) => {
        const videoElement = document.getElementById('ending-video');
        const skipButton = document.getElementById('skip-ending-btn');

        engine.audioManager.stopBgm();

        // 封装统一的返回主菜单逻辑
        const returnToMainMenu = () => {
            // 移除监听器，防止重复触发
            videoElement.removeEventListener('ended', returnToMainMenu);
            skipButton.removeEventListener('click', handleSkipClick);

            console.log('片尾结束，返回主菜单。');
            
            engine.animation.play('fadeInBlack').then(() => {
                // 在显示主菜单前，清空当前游戏状态
                engine.gameState.currentSave = null; 
                engine.showView('MainMenu');
                engine.animation.play('fadeOutBlack');
            });
        };

        // 创建跳过按钮的点击处理函数
        const handleSkipClick = () => {
            engine.audioManager.playSoundEffect('click');
            returnToMainMenu();
        };

        // 绑定事件
        videoElement.addEventListener('ended', returnToMainMenu, { once: true });
        skipButton.addEventListener('click', handleSkipClick, { once: true });

        // 同样处理视频播放错误的情况，直接返回主菜单
        videoElement.addEventListener('error', (e) => {
            console.error("片尾视频加载/播放失败:", e, "将直接返回主菜单。");
            returnToMainMenu();
        }, { once: true });
        
        // 尝试播放，处理浏览器可能阻止自动播放的情况
        videoElement.play().catch(error => {
            console.warn("片尾视频自动播放被浏览器阻止，需要用户交互。");
            // 在这种情况下，跳过按钮是用户继续的途径。
        });
    }
};

export default EndingView;