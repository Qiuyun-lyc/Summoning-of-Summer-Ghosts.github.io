export default class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.sentencePrinter = null;
        this.tooltipTimeout = null;
        this._fsChangeHandlerBound = null;

        // 自动播放
        this.isAutoPlay = false;
        this.autoDelayAfterTypingMs = 600; // 没有动画时的延迟
        this.autoDelayAfterAnimMs  = 2000; // 动画结束后的额外等待
        this._autoWatcher = null;
        this._autoBtnBound = false;

        // 记录当前节点是否“出现过动画”
        this._animSeenThisNode = false;

        // 快捷键：A 切换自动播放（不改 DOM 结构）
        document.addEventListener('keydown', (e) => {
            const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
            if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;
            if (e.key.toLowerCase() === 'a') this.toggleAutoPlay();
        });

        // 尝试绑定原位置按钮
        document.addEventListener('DOMContentLoaded', () => this._bindAutoPlayButtonIfAny());
        setTimeout(() => this._bindAutoPlayButtonIfAny(), 0);
    }

    _bindAutoPlayButtonIfAny() {
        if (this._autoBtnBound) return;
        const btn = document.getElementById('auto-play-btn');
        if (!btn) return;
        btn.addEventListener('click', () => this.toggleAutoPlay());
        this._autoBtnBound = true;
        this.updateAutoPlayButton(this.isAutoPlay);
    }

    clearContainer() {
        this.engine.container.innerHTML = '';
        this.sentencePrinter = null;
    }
    
    renderNode(node) {
        // 确保游戏视图元素存在
        if (!document.querySelector('.game-view')) return;

        // 新节点渲染时，重置“本节点是否出现过动画”的标记
        this._animSeenThisNode = false;

        // 再尝试一次绑定原位置按钮
        this._bindAutoPlayButtonIfAny();

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
            if (!this.sentencePrinter || typeof this.sentencePrinter.print !== 'function') {
                this.sentencePrinter = this.engine.sentencePrinter || this.sentencePrinter;
            }
            this.sentencePrinter?.print?.(textContent);
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

        // 自动播放观察（如果开启）
        this._armAutoAdvanceWatcher(node);
    }

    // === 自动播放：核心 ===
    toggleAutoPlay(forceState) {
        this.isAutoPlay = (typeof forceState === 'boolean') ? forceState : !this.isAutoPlay;

        // 同步给引擎（若有）
        this.engine.setAutoPlay?.(this.isAutoPlay);

        // 更新原按钮外观（只切 class，保留原格式与文案）
        this.updateAutoPlayButton(this.isAutoPlay);

        // 立即对当前节点生效
        const node = this.engine?.gameState?.currentNode || this.engine?.getCurrentNode?.();
        if (node) this._armAutoAdvanceWatcher(node, { immediateTick: this.isAutoPlay });
    }

    _armAutoAdvanceWatcher(node, opts = {}) {
        if (this._autoWatcher) {
            cancelAnimationFrame(this._autoWatcher);
            this._autoWatcher = null;
        }
        if (!this.isAutoPlay) return;

        const { immediateTick = false } = opts;

        const watch = () => {
            // 若当前存在动画在播放，记录“本节点出现过动画”
            if (this._isAnimationRunning()) {
                this._animSeenThisNode = true;
            }

            const isChoices = node.type === 'choices';
            const typingFinished = !this.isPrinting();
            const animFinished  = !this._isAnimationRunning();

            // 条件：不是选项 + 打字结束 + 动画结束
            if (!isChoices && typingFinished && animFinished) {
                const delay = this._animSeenThisNode
                    ? this.autoDelayAfterAnimMs
                    : this.autoDelayAfterTypingMs;

                setTimeout(() => this._advanceOneStep(), delay);
                this._autoWatcher = null;
                return;
            }

            // 继续监听
            this._autoWatcher = requestAnimationFrame(watch);
        };

        if (immediateTick) {
            watch();
        } else {
            this._autoWatcher = requestAnimationFrame(watch);
        }
    }

    _advanceOneStep() {
        const e = this.engine || {};
        try {
            if (typeof e.advance === 'function') return e.advance();
            if (typeof e.goNext === 'function') return e.goNext();
            if (typeof e.next === 'function') return e.next();
            if (typeof e.onUserNext === 'function') return e.onUserNext();
            if (e.story && typeof e.story.next === 'function') return e.story.next();
            // 兜底：触发事件或模拟点击
            document.dispatchEvent(new CustomEvent('ui:auto-next'));
            document.querySelector('.dialogue-group')?.click?.();
        } catch (err) {
            console.warn('Auto advance failed:', err);
        }
    }

    // 判定“是否有动画在播放”
    _isAnimationRunning() {
        const anim = this.engine?.animation;
        try {
            if (!anim) return false;
            if (typeof anim.isPlaying === 'function') return !!anim.isPlaying();
            if (typeof anim.isAnyPlaying === 'function') return !!anim.isAnyPlaying();
            if (typeof anim.isBusy === 'function') return !!anim.isBusy();
            if (typeof anim.isRunning === 'function') return !!anim.isRunning();
            // 常见的布尔位兜底
            if (typeof anim.isPlaying === 'boolean') return anim.isPlaying;
            if (typeof anim.running === 'boolean') return anim.running;
        } catch (e) { /* 安全兜底 */ }
        return false;
    }
    // === 自动播放：核心结束 ===

    isPrinting() {
        return this.sentencePrinter && !this.sentencePrinter.hasFinished();
    }

    skipPrinting() {
        this.sentencePrinter?.skip();
    }
    
    togglePauseMenu(show) {
        let menu = document.getElementById('ingame-menu-overlay');
    
        if (show) {
            if (!menu) {
                menu = document.createElement('div');
                menu.id = 'ingame-menu-overlay';
                menu.className = 'ingame-menu-overlay';
    
                // 创建菜单的 HTML 结构和样式（含全屏按钮）
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
                        <div class="ingame-menu-item" data-action="fullscreen" id="pause-fs-btn">
                            <img src="./assets/img/button.png">
                            <span class="fs-label"></span>
                        </div>
                        <div class="ingame-menu-item" data-action="title">
                            <img src="./assets/img/button.png">
                            <span>${this.engine.localization.get('ui.title')}</span>
                        </div>
                    </div>
                `;
                
                document.body.appendChild(menu);
    
                // 绑定事件
                menu.querySelector('[data-action="unpause"]')
                    .addEventListener('click', () => { 
                        this.engine.audioManager.playSoundEffect('click'); 
                        this.engine.unpauseGame(); 
                    });

                menu.querySelector('[data-action="save_load"]')
                    .addEventListener('click', () => { 
                        this.engine.audioManager.playSoundEffect('click'); 
                        this.engine.unpauseGame(); 
                        this.engine.showView('Load'); 
                    });

                menu.querySelector('[data-action="fullscreen"]')
                    .addEventListener('click', async () => {
                        this.engine.audioManager.playSoundEffect('click');
                        try {
                            if (this.engine.toggleFullscreen) {
                                await this.engine.toggleFullscreen();
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
                        this._updatePauseMenuFullscreenLabel(menu);
                    });

                menu.querySelector('[data-action="title"]')
                    .addEventListener('click', () => { 
                        this.engine.audioManager.playSoundEffect('click'); 
                        this.engine.unpauseGame(); 
                        this.engine.showView('MainMenu'); 
                    });

                menu.querySelectorAll('.ingame-menu-item')
                    .forEach(item => item.addEventListener('mouseover', () => this.engine.audioManager.playSoundEffect('hover')));

                this._bindFullscreenChangeForPauseMenu(menu);
            }
            
            this._updatePauseMenuFullscreenLabel(menu);

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

    _bindFullscreenChangeForPauseMenu(menu) {
        if (this._fsChangeHandlerBound) return;
        this._fsChangeHandlerBound = () => this._updatePauseMenuFullscreenLabel(menu);
        document.addEventListener('fullscreenchange', this._fsChangeHandlerBound);
    }

    _updatePauseMenuFullscreenLabel(menu) {
        if (!menu) return;
        const labelEl = menu.querySelector('#pause-fs-btn .fs-label');
        if (!labelEl) return;
        const L = this.engine.localization;
        const isFs = !!document.fullscreenElement;
        labelEl.textContent = isFs
            ? (L.get('关闭全屏') || '关闭全屏')
            : (L.get('全屏模式') || '全屏模式');
    }

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
                    entryElement.className = 'history-choice';
                    entryElement.textContent = `> ${entry.text}`;
                } else {
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
            overlay.style.display = 'none';
            this.engine.gameState.isHistoryVisible = false;
        }
    }

    displayTooltip(message, duration = 0) {
        const tooltip = document.getElementById('game-tooltip');
        if (!tooltip) return;

        if (this.tooltipTimeout) {
            clearTimeout(this.tooltipTimeout);
            this.tooltipTimeout = null;
        }
        
        tooltip.innerHTML = message;
        tooltip.classList.remove('hidden');
        requestAnimationFrame(() => tooltip.classList.add('visible'));

        if (duration > 0) {
            this.tooltipTimeout = setTimeout(() => this.hideTooltip(), duration);
        }
    }

    hideTooltip() {
        const tooltip = document.getElementById('game-tooltip');
        if (!tooltip) return;
        tooltip.classList.remove('visible');
        setTimeout(() => tooltip.classList.add('hidden'), 500);
    }

    updateAutoPlayButton(isActive) {
        const button = document.getElementById('auto-play-btn');
        if (button) {
            // 仅切换样式，不改变你原有的按钮文案与结构
            button.classList.toggle('active', isActive);
        }
    }

    showAchievementPopup(achievementId) {
        const achievement = this.engine.dataManager.getAllAchievements().find(a => a.id === achievementId);
        if (!achievement) return;

        this.engine.audioManager.playSoundEffect('sysYes'); 

        const popup = document.createElement('div');
        popup.className = 'achievement-popup';

        popup.innerHTML = `
            <style>
                .achievement-popup {
                    position: fixed;
                    bottom: 20px;
                    right: -400px;
                    width: 350px;
                    background-color: rgba(0, 0, 0, 0.85);
                    border-left: 5px solid #ffd700;
                    border-radius: 10px 0 0 10px;
                    padding: 15px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 1001;
                    color: white;
                    transition: right 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
                    box-shadow: 0 0 20px rgba(0,0,0,0.5);
                }
                .achievement-popup.show { right: 20px; }
                .popup-icon {
                    width: 60px; height: 60px; border-radius: 50%; object-fit: cover;
                }
                .popup-text h4 { margin: 0 0 5px 0; color: #ffd700; font-size: 1.1em; }
                .popup-text p { margin: 0; font-size: 0.9em; }
            </style>
            <img class="popup-icon" src="${achievement.icon}" alt="成就">
            <div class="popup-text">
                <h4>成就解锁</h4>
                <p>${achievement.name}</p>
            </div>
        `;

        document.body.appendChild(popup);
        requestAnimationFrame(() => popup.classList.add('show'));
        setTimeout(() => {
            popup.classList.remove('show');
            popup.addEventListener('transitionend', () => popup.remove(), { once: true });
        }, 4000);
    }
}
