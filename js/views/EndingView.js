const EndingView = {
    render: (container, engine) => {
        container.innerHTML = `
            <style>
                .ending-view {
                    position: relative;
                    width: 100%;
                    height: 100%;
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
            </style>
            <div class="view ending-view">
                <video id="ending-video" src="./assets/video/ending.mov" autoplay></video>
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