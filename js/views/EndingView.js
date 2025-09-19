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

        engine.audioManager.stopBgm();

        videoElement.addEventListener('ended', () => {
            console.log('片尾视频播放完毕，返回主菜单。');
            
            engine.animation.play('fadeInBlack').then(() => {
                engine.showView('MainMenu');
                engine.animation.play('fadeOutBlack');
            });
        });
        

    }
};

export default EndingView;