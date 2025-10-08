const MainMenuView = {
  render: (container, engine) => {
    const L = engine.localization;
    const bgImages = ['./assets/img/bgr/mainmenu.png'];
    const randomIndex = Math.floor(Math.random() * bgImages.length);

    container.innerHTML = `
      <style>
        :root{
          --title-font-size: clamp(24px, 4vw, 48px);
          --btn-width: clamp(12rem, 16vw, 18rem);
          --btn-font-scale: 0.78;
          --btn-hover-scale: 1.03;

          /* ≈间距控制：值越“负”越挤，这里略微放松，从 -6px 改为 -2px */
          --btn-stack-overlap: -2px;

          /* 按钮整体向下偏移（可按需调整） */
          --btn-group-offset: 8vh;
        }

        .view.main-menu-view{
          width:100vw;height:100vh;position:relative;overflow:hidden;
        }
        .bg{position:absolute;inset:0;background-size:cover;background-position:center;z-index:-1;}

        .menu-container{
          position:absolute;top:4%;right:clamp(24px,3vw,50px);
          display:flex;flex-direction:column;align-items:flex-end;
        }

        .header{display:flex;flex-direction:column;align-items:flex-end;margin-bottom:56vh;width:100%;}
        .header-title,.header-subtitle{color:#fff;text-shadow:0 2px 4px rgba(0,0,0,.45);}
        .header-title{font-size:var(--title-font-size);line-height:1.05;}
        .header-subtitle{
          font-size:calc(var(--title-font-size)*1.06);opacity:.85;margin-top:.08em;
          align-self:flex-end;text-align:right;margin-right:-1.5em;
        }

        /* 按钮组整体位置与基础“无缝”布局 */
        .main-menu-button-group{
          display:flex;flex-direction:column;align-items:flex-end;gap:0;
          font-size:0;
          margin-top: var(--btn-group-offset);
        }

        .main-menu-button{
          position:relative;display:block;line-height:0;cursor:pointer;
          transition:transform .18s ease, filter .18s ease;
          will-change:transform;filter:drop-shadow(0 4px 10px rgba(0,0,0,.25));
          margin:0;
        }
        /* 用轻微负 margin 叠住 PNG 的透明边；从 -6px 放松到 -2px = 间距略增 */
        .main-menu-button + .main-menu-button{ margin-top: var(--btn-stack-overlap); }

        .main-menu-button img.button-img{
          width:var(--btn-width);height:auto;display:block;
        }
        .main-menu-button a{
          position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
          white-space:nowrap;text-align:center;pointer-events:none;line-height:1;
          font-size:calc(var(--title-font-size)*var(--btn-font-scale));
          color:#fff;text-shadow:0 2px 6px rgba(0,0,0,.6);
        }
        .main-menu-button:hover img.button-img{transform:scale(var(--btn-hover-scale));}

        @media (max-width: 720px){
          :root{
            --btn-width: clamp(10.5rem, 42vw, 14rem);
            --btn-font-scale: 0.74;
            --btn-stack-overlap: -1px; /* 小屏同样略微放松 */
            --btn-group-offset: 10vh;
          }
          .header{margin-bottom:52vh;}
        }

        @media (min-width: 1600px){
          :root{
            --btn-width: 20rem;
            --btn-font-scale: 0.8;
            --btn-stack-overlap: 8px; /* 宽屏保持与默认一致的轻微贴合 */
            --btn-group-offset: 7vh;
          }
        }
      </style>

      <div class="view main-menu-view">
        <div class="bg" style="background-image:url('${bgImages[randomIndex]}');"></div>

        <div class="menu-container">
          <div class="header fade-in">
            <a class="header-title">夏日幻魂</a>
            <a class="header-subtitle">ゆうれいのしょうかん</a>
          </div>

          <div class="main-menu-button-group">
            <div class="main-menu-button" data-action="start">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.start')}</a>
            </div>
            <div class="main-menu-button" data-action="load">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.load')}</a>
            </div>
            <div class="main-menu-button" data-action="achievement">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.achievement')}</a>
            </div>
            <div class="main-menu-button" data-action="settings">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('设置') ?? '设置'}</a>
            </div>
            <div class="main-menu-button" data-action="about">
              <img class="button-img" src="./assets/img/button.png" alt="">
              <a>${L.get('ui.about')}</a>
            </div>
          </div>
        </div>
      </div>
    `;

    const bgmMap = {
      './assets/img/bgr/mainmenu.png': './assets/bgm/test.mp3',
    };
    engine.audioManager.playBgm(bgmMap[bgImages[randomIndex]], true);
  },

  attachEventListeners: (container, engine) => {
    const buttons = container.querySelectorAll('.main-menu-button');
    buttons.forEach(button => {
      button.addEventListener('mouseover', () => {
        engine.audioManager.playSoundEffect('titleHover');
      });
      button.addEventListener('click', async (e) => {
        engine.audioManager.playSoundEffect('titleClick');
        const action = e.currentTarget.dataset.action;

        await engine.animation.fadeOutBlack();

        switch (action) {
          case 'start': engine.startNewGame(); break;
          case 'load': engine.showView('Load'); break;
          case 'settings': engine.showView('Settings'); break;
          case 'achievement': engine.showView('Achievement'); break;
          case 'about': engine.showView('About'); break;
        }
      });
    });
  }
};

export default MainMenuView;
