const OpeningView = {
    render: (container, engine, params) => {
        // 确保我们接收到了新游戏存档，否则这是个逻辑错误
        if (!params || !params.newGameSave) {
            console.error("OpeningView 缺少 newGameSave 参数，无法启动游戏。");
            // 紧急回退到主菜单
            engine.showView('MainMenu');
            return;
        }

        container.innerHTML = `
            <style>
                .opening-view {
                    position: relative;
                    width: 100%;
                    height: 100vh;
                    background-color: #000;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                #opening-video {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                }
                #skip-opening-btn {
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
                #skip-opening-btn:hover {
                    opacity: 1;
                    background-color: rgba(255, 255, 255, 0.2);
                }
            </style>
            <div class="view opening-view">
                <video id="opening-video" src="./assets/video/opening.mov" autoplay></video>
                <button id="skip-opening-btn">跳过开场</button>
            </div>
        `;
    },

    attachEventListeners: (container, engine, params) => {
        const videoElement = document.getElementById('opening-video');
        const skipButton = document.getElementById('skip-opening-btn');
        const newGameSave = params.newGameSave;

        engine.audioManager.stopBgm();

        // 封装一个统一的“开始游戏”函数
        const proceedToGame = async () => {
            // 防止重复触发
            videoElement.removeEventListener('ended', proceedToGame);
            skipButton.removeEventListener('click', proceedToGame);

            // 淡入黑屏以实现平滑过渡
            await engine.animation.play('fadeInBlack');
            
            // 使用传入的新存档数据开始游戏
            engine.startGame(newGameSave);
        };

        videoElement.addEventListener('ended', proceedToGame, { once: true });
        skipButton.addEventListener('click', () => {
            engine.audioManager.playSoundEffect('click');
            proceedToGame();
        }, { once: true });

        videoElement.addEventListener('error', (e) => {
            console.error("开场视频加载/播放失败:", e, "将直接开始游戏。");
            proceedToGame();
        }, { once: true });
        
        // 尝试播放，处理浏览器可能阻止自动播放的情况
        videoElement.play().catch(error => {
            console.warn("视频自动播放被浏览器阻止，需要用户交互。显示跳过按钮以继续。");
            // 在这种情况下，跳过按钮是用户继续游戏的唯一途径。
        });
    }
};

export default OpeningView;