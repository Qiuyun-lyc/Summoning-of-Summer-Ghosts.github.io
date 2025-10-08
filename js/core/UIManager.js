export default class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.sentencePrinter = null;
    }

    clearContainer() {
        this.engine.container.innerHTML = '';
        this.sentencePrinter = null;
    }
    
    renderNode(node) {
        // 确保游戏视图元素存在
        if (!document.querySelector('.game-view')) return;

        const bgr = document.getElementById('game-bgr');
        const lChar = document.getElementById('l-char');
        const rChar = document.getElementById('r-char');
        const nameBox = document.getElementById('dialogue-name');
        const dialogueGroup = document.querySelector('.dialogue-group');
        const choiceGroup = document.querySelector('.choice-group');

        // 背景
        if (node.bgr) {
            bgr.src = `./assets/img/bgr/${node.bgr}.png`;
        }

        // 角色立绘
        lChar.src = node.lCharactor ? `./assets/img/character/${node.lCharactor}.png` : '';
        document.getElementById('l-char-box').style.display = node.lCharactor ? 'flex' : 'none';
        rChar.src = node.rCharactor ? `./assets/img/character/${node.rCharactor}.png` : '';
        document.getElementById('r-char-box').style.display = node.rCharactor ? 'flex' : 'none';
        
        // 对话
        if (node.type === 'text' || node.type === 'choices') {
            dialogueGroup.style.display = 'block';
            nameBox.textContent = node.name ? this.engine.localization.get(`story.name.${node.name}`) : '';
            const textKey = `story.nodes.${this.engine.gameState.currentSave.nodeId}.text`;
            const textContent = this.engine.localization.get(textKey);
            this.sentencePrinter.print(textContent);
        } else {
            dialogueGroup.style.display = 'none';
        }

        // 选项
        if (node.type === 'choices') {
            choiceGroup.style.display = 'flex';
            const choiceButtons = choiceGroup.querySelectorAll('.choice-line');
            const choiceTextKey = `story.nodes.${this.engine.gameState.currentSave.nodeId}.choices`;
            const choiceData = this.engine.localization.get(choiceTextKey);
            
            choiceButtons.forEach((button, index) => {
                if (index < node.onNext.choice.length) {
                    button.querySelector('.choice-text').textContent = choiceData[index];
                    button.style.display = 'block';
                } else {
                    button.style.display = 'none';
                }
            });
        } else {
            choiceGroup.style.display = 'none';
        }
        
        // 特殊图片仅在节点 30483 时显示，否则隐藏
        try {
            const specialImg = document.getElementById('special-click-img');
            if (specialImg) {
                const currentNodeId = this.engine && this.engine.gameState && this.engine.gameState.currentSave
                    ? this.engine.gameState.currentSave.nodeId
                    : null;
                // 兼容字符串/数字类型
                if (String(currentNodeId) === '30483') {
                    specialImg.style.display = 'inline-block';
                } else {
                    specialImg.style.display = 'none';
                }
            }
        } catch (e) {
            // 不影响渲染主流程
            console.warn('设置 special-click-img 可见性时出错:', e);
        }
    }

    isPrinting() {
        return this.sentencePrinter && !this.sentencePrinter.hasFinished();
    }

    skipPrinting() {
        if (this.sentencePrinter) {
            this.sentencePrinter.skip();
        }
    }
    
    togglePauseMenu(show) {
        let menu = document.getElementById('ingame-menu-overlay');
    
        if (show) {
            if (!menu) {
                menu = document.createElement('div');
                menu.id = 'ingame-menu-overlay';
                menu.className = 'ingame-menu-overlay';
    
                // 创建菜单的 HTML 结构和样式
                menu.innerHTML = `
                    <style>
                        .ingame-menu-overlay {
                            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                            background-color: rgba(0, 0, 0, 0.7);
                            display: flex; justify-content: center; align-items: center;
                            z-index: 999;
                            opacity: 0; transition: opacity 0.3s ease;
                            backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
                        }
                        .ingame-menu-overlay.visible { opacity: 1; }
                        .ingame-menu-content { display: flex; flex-direction: column; gap: 20px; align-items: center; }
                        .ingame-menu-item { position: relative; width: 280px; cursor: pointer; text-align: center; }
                        .ingame-menu-item img { width: 100%; transition: transform 0.2s ease; }
                        .ingame-menu-item:hover img { transform: scale(1.05); }
                        .ingame-menu-item span {
                            position: absolute; top: 50%; left: 50%;
                            transform: translate(-50%, -50%);
                            font-family: 'lilyshow', 'FangSong', '仿宋', 'SimSun', sans-serif;
                            font-size: 28px; color: white;
                            text-shadow: 2px 2px 4px #000;
                            pointer-events: none;
                        }
                    </style>
                    <div class="ingame-menu-content">
                        <div class="ingame-menu-item" data-action="unpause">
                            <img src="./assets/img/button.png">
                            <span>${this.engine.localization.get('ui.continue')}</span>
                        </div>
                        <div class="ingame-menu-item" data-action="save_load">
                            <img src="./assets/img/button.png">
                            <span>${this.engine.localization.get('ui.save_load')}</span>
                        </div>
                        <!-- 新增全屏按钮 -->
                        <div class="ingame-menu-item" data-action="fullscreen">
                            <img src="./assets/img/button.png">
                            <span id="fullscreen-label">
                                ${document.fullscreenElement ? this.engine.localization.get('退出全屏') : this.engine.localization.get('全屏模式')}
                            </span>
                        </div>
                        <div class="ingame-menu-item" data-action="title">
                            <img src="./assets/img/button.png">
                            <span>${this.engine.localization.get('ui.title')}</span>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(menu);
    
                // 绑定事件
                menu.querySelector('[data-action="unpause"]').addEventListener('click', () => { 
                    this.engine.audioManager.playSoundEffect('click'); 
                    this.engine.unpauseGame(); 
                });
                menu.querySelector('[data-action="save_load"]').addEventListener('click', () => { 
                    this.engine.audioManager.playSoundEffect('click'); 
                    this.engine.unpauseGame(); 
                    this.engine.showView('Load'); 
                });
                menu.querySelector('[data-action="fullscreen"]').addEventListener('click', () => { 
                    this.engine.audioManager.playSoundEffect('click'); 
                    if (!document.fullscreenElement) {
                        document.documentElement.requestFullscreen();
                    } else {
                        document.exitFullscreen();
                    }
                });
                menu.querySelector('[data-action="title"]').addEventListener('click', () => { 
                    this.engine.audioManager.playSoundEffect('click'); 
                    this.engine.unpauseGame(); 
                    this.engine.showView('MainMenu'); 
                });
    
                menu.querySelectorAll('.ingame-menu-item').forEach(item => { 
                    item.addEventListener('mouseover', () => this.engine.audioManager.playSoundEffect('hover')); 
                });
    
                // 监听全屏切换事件，动态更新文字
                document.addEventListener('fullscreenchange', () => {
                    const label = document.getElementById('fullscreen-label');
                    if (label) {
                        label.textContent = document.fullscreenElement 
                            ? this.engine.localization.get('退出全屏') 
                            : this.engine.localization.get('全屏模式');
                    }
                });
            }
            
            menu.style.display = 'flex';
            requestAnimationFrame(() => { menu.classList.add('visible'); });
    
        } else {
            if (menu) {
                menu.classList.remove('visible');
                menu.addEventListener('transitionend', () => {
                    menu.style.display = 'none';
                }, { once: true });
            }
        }
    }

    /**
     * 控制对话历史浮层的显示与隐藏，并填充内容
     * @param {boolean} show - true 为显示, false 为隐藏
     */
    toggleHistory(show) {
        const overlay = document.getElementById('dialogue-history-overlay');
        if (!overlay) return;

        if (show) {
            const contentContainer = document.getElementById('history-content');
            const historyData = this.engine.gameState.currentSave.dialogueHistory;
            
            contentContainer.innerHTML = '';
            historyData.forEach(entry => {
                const entryElement = document.createElement('div');

                if (entry.type === 'choice') {
                    // 选择
                    entryElement.className = 'history-choice';
                    entryElement.textContent = `> ${entry.text}`;
                } else {
                    // 对话
                    entryElement.className = 'history-entry';
                    const speakerName = this.engine.localization.get(`story.name.${entry.speaker}`);
                    if (speakerName.trim()) {
                        entryElement.innerHTML += `<div class="history-speaker">${speakerName}</div>`;
                    }
                    entryElement.innerHTML += `<p class="history-text">${entry.text}</p>`;
                }
                
                contentContainer.appendChild(entryElement);
            });
            
            overlay.style.display = 'flex';
            
            contentContainer.scrollTop = contentContainer.scrollHeight;

            this.engine.gameState.isHistoryVisible = true;

        } else {
            // 隐藏浮层
            overlay.style.display = 'none';

            this.engine.gameState.isHistoryVisible = false;
        }
    }

    displayTooltip(message, duration = 0) {
        const tooltip = document.getElementById('game-tooltip');
        if (!tooltip) return;

        // 清除上一个计时器（如果有）
        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        
        tooltip.innerHTML = message;
        tooltip.classList.remove('hidden');
        
        // 使用 requestAnimationFrame 确保在下一帧应用 'visible' 类以触发过渡
        requestAnimationFrame(() => {
            tooltip.classList.add('visible');
        });

        if (duration > 0) {
            this.tooltipTimeout = setTimeout(() => {
                this.hideTooltip();
            }, duration);
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('game-tooltip');
        if (!tooltip) return;

        tooltip.classList.remove('visible');
        // 在过渡动画结束后再添加 hidden 类
        setTimeout(() => {
            tooltip.classList.add('hidden');
        }, 500); // 500ms 匹配CSS中的过渡时间
    }

    updateAutoPlayButton(isActive) {
        const button = document.getElementById('auto-play-btn');
        if (button) {
            button.classList.toggle('active', isActive);
        }
    }

    showAchievementPopup(achievementId) {
        const achievement = this.engine.dataManager.getAllAchievements().find(a => a.id === achievementId);
        if (!achievement) return;

        // 播放解锁音效
        this.engine.audioManager.playSoundEffect('sysYes'); 

        const popup = document.createElement('div');
        popup.className = 'achievement-popup';

        popup.innerHTML = `
            <style>
                .achievement-popup {
                    position: fixed;
                    bottom: 20px;
                    right: -400px; /* 初始位置在屏幕外 */
                    width: 350px;
                    background-color: rgba(0, 0, 0, 0.85);
                    border-left: 5px solid #ffd700;
                    border-radius: 10px 0 0 10px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 1001; /* 确保在最顶层 */
                    color: white;
                    transition: right 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
                    box-shadow: 0 0 20px rgba(0,0,0,0.5);
                }
                .achievement-popup.show {
                    right: 20px; /* 滑入到屏幕内 */
                }
                .popup-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    object-fit: cover;
                }
                .popup-text h4 {
                    margin: 0 0 5px 0;
                    color: #ffd700;
                    font-size: 1.1em;
                }
                .popup-text p {
                    margin: 0;
                    font-size: 0.9em;
                }
            </style>
            <img class="popup-icon" src="${achievement.icon}" alt="成就">
            <div class="popup-text">
                <h4>成就解锁</h4>
                <p>${achievement.name}</p>
            </div>
        `;

        document.body.appendChild(popup);

        // 动画流程
        requestAnimationFrame(() => {
            popup.classList.add('show');
        });

        setTimeout(() => {
            popup.classList.remove('show');
            popup.addEventListener('transitionend', () => {
                popup.remove();
            }, { once: true });
        }, 4000);
    }
    
    /**
     * 显示一个简单的确认模态框，返回一个 Promise，用户点击确认后 resolve。
     * message 默认为 '恭喜你解锁隐藏剧情!'
     */
    showUnlockModal(message = '恭喜你解锁隐藏剧情!') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'unlock-modal-overlay';

            overlay.innerHTML = `
                <style>
                    .unlock-modal-overlay {
                        position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
                        background: rgba(0,0,0,0.6); z-index: 2000;
                    }
                    .unlock-modal {
                        background: rgba(10,10,10,0.95); color: #fff; padding: 22px; border-radius: 10px;
                        width: 420px; max-width: 92%; box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                        font-family: 'lilyshow', 'Arial', sans-serif; text-align: center;
                    }
                    .unlock-modal h3 { margin: 0 0 8px 0; color: #ffd700; }
                    .unlock-modal p { margin: 0 0 16px 0; font-size: 16px; }
                    .unlock-modal .actions { display:flex; justify-content:center; gap:12px; }
                    .unlock-modal .btn { padding: 10px 18px; border-radius: 6px; cursor: pointer; border: none; font-size: 14px; }
                    .unlock-modal .btn.confirm { background: linear-gradient(90deg,#ffb347,#ffcc33); color:#111; }
                </style>
                <div class="unlock-modal" role="dialog" aria-modal="true">
                    <h3>隐藏剧情已解锁</h3>
                    <p>${message}</p>
                    <div class="actions">
                        <button class="btn confirm" id="unlock-confirm">确定</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const confirmBtn = overlay.querySelector('#unlock-confirm');
            const cleanup = () => {
                overlay.remove();
            };

            const onConfirm = () => {
                cleanup();
                resolve(true);
            };

            confirmBtn.addEventListener('click', onConfirm);

            // 支持回车确认
            const onKey = (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onConfirm();
                }
            };
            document.addEventListener('keydown', onKey);

            // 在清理时移除键盘事件
            const originalResolve = resolve;
            // wrap resolve to clean listeners just in case
            const wrappedResolve = (v) => {
                document.removeEventListener('keydown', onKey);
                originalResolve(v);
            };
            // replace resolve in closure
            resolve = wrappedResolve;
        });
    }
}
