// MainMenuView.js
const MainMenuView = {
  render(container, engine) {
    const L = engine.localization;
    const bgImages = ['./assets/img/bgr/mainmenu.png'];
    const bg = bgImages[Math.floor(Math.random() * bgImages.length)];

    container.innerHTML = `
      <div class="view main-menu-view">
        <div class="bg" style="background-image: url('${bg}');"></div>
        <div class="header fade-in">
          <a class="header-title">夏日幻魂</a>
        </div>
        <div class="main-menu-button-group">
          <div class="main-menu-button" data-action="start">
            <img class="button-img" src="./assets/img/button.png">
            <a>${L.get('ui.start') || '开始'}</a>
          </div>
          <div class="main-menu-button" data-action="load">
            <img class="button-img" src="./assets/img/button.png">
            <a>${L.get('ui.load') || '读取进度'}</a>
          </div>
          <div class="main-menu-button" data-action="achievement">
            <img class="button-img" src="./assets/img/button.png">
            <a>${L.get('ui.achievement') || '成就'}</a>
          </div>
          <div class="main-menu-button" data-action="about">
            <img class="button-img" src="./assets/img/button.png">
            <a>${L.get('ui.about') || '关于'}</a>
          </div>
          <!-- 全屏按钮 -->
          <div class="main-menu-button" id="fullscreen-btn" data-action="fullscreen">
            <img class="button-img" src="./assets/img/button.png">
            <a class="label"></a>
          </div>
        </div>
      </div>
    `;

    // 初始化全屏按钮文案
    MainMenuView.updateFullscreenLabel(container, L);

    // 监听全屏状态变化（ESC/F11 退出也能同步文案）
    document.addEventListener('fullscreenchange', () => {
      MainMenuView.updateFullscreenLabel(container, L);
    });

    // 播放背景音乐
    const bgmMap = {
      './assets/img/bgr/mainmenu.png': './assets/bgm/test.mp3',
    };
    engine.audioManager.playBgm(bgmMap[bg] || bgmMap['./assets/img/bgr/mainmenu.png'], true);
  },

  updateFullscreenLabel(container, L) {
    const labelEl = container.querySelector('#fullscreen-btn .label');
    if (!labelEl) return;
    const isFs = !!document.fullscreenElement;
    labelEl.textContent = isFs
      ? (L.get('关闭全屏') || '关闭全屏')
      : (L.get('全屏模式') || '全屏模式');
  },

  attachEventListeners(container, engine) {
    const buttons = container.querySelectorAll('.main-menu-button');
    buttons.forEach((btn) => {
      btn.addEventListener('mouseover', () => {
        engine.audioManager.playSoundEffect?.('titleHover');
      });

      btn.addEventListener('click', async (e) => {
        engine.audioManager.playSoundEffect?.('titleClick');
        const action = e.currentTarget.dataset.action;

        // 全屏切换不做黑屏淡出，避免闪烁
        if (action !== 'fullscreen') {
          await engine.animation.fadeOutBlack?.();
        }

        switch (action) {
          case 'start':
            engine.startNewGame?.();
            break;
          case 'load':
            engine.showView?.('Load');
            break;
          case 'achievement':
            engine.showView?.('Achievement');
            break;
          case 'about':
            engine.showView?.('About');
            break;
          case 'fullscreen': {
            try {
              if (engine.toggleFullscreen) {
                await engine.toggleFullscreen();
              } else {
                const el = document.documentElement;
                if (!document.fullscreenElement) {
                  await el.requestFullscreen?.();
                } else {
                  await document.exitFullscreen?.();
                }
              }
            } catch (err) {
              console.warn('Fullscreen toggle failed:', err);
            }
            // 双保险，立即刷新一次文案（除了 fullscreenchange 事件之外）
            MainMenuView.updateFullscreenLabel(container, engine.localization);
            break;
          }
        }
      });
    });
  },
};

export default MainMenuView;

/*
使用方式（示例）：
import MainMenuView from './MainMenuView.js';
const container = document.getElementById('app');
MainMenuView.render(container, engine);
MainMenuView.attachEventListeners(container, engine);

多语言键建议新增：
ui.start=开始
ui.load=读取进度
ui.achievement=成就
ui.about=关于
ui.fullscreen=全屏模式
ui.exit_fullscreen=关闭全屏
*/
