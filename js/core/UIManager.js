//import SentencePrinter from '../modules/SentencePrinter.js';

export default class UIManager {
    constructor(engine) {
        this.engine = engine;
        this.sentencePrinter = null;
        // BigTextPrinter can be another instance if needed
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
    }

    isPrinting() {
        return this.sentencePrinter && !this.sentencePrinter.hasFinished();
    }

    skipPrinting() {
        if (this.sentencePrinter) {
            this.sentencePrinter.skip();
        }
    }
    
    togglePauseMenu(show, fromGameView) {
        let menu = document.getElementById('pause-menu');
        if (show) {
            if (!menu) {
                menu = document.createElement('div');
                menu.id = 'pause-menu';
                menu.className = 'pause-menu';
                
                const canContinue = fromGameView && this.engine.gameState.currentSave;
                
                menu.innerHTML = `
                    <div class="pause-button-group">
                        ${canContinue ? `<div class="pause-menu-button" data-action="unpause"><a>${this.engine.localization.get('ui.continue')}</a></div>` : ''}
                        <div class="pause-menu-button" data-action="save_load"><a>${this.engine.localization.get('ui.save_load')}</a></div>
                        <div class="pause-menu-button" data-action="title"><a>${this.engine.localization.get('ui.title')}</a></div>
                    </div>
                `;
                document.querySelector('.game-view')?.appendChild(menu); // Append to game view if it exists
                
                menu.querySelector('[data-action="unpause"]')?.addEventListener('click', () => this.engine.unpauseGame());
                menu.querySelector('[data-action="save_load"]')?.addEventListener('click', () => { this.engine.unpauseGame(); this.engine.showView('Load'); });
                menu.querySelector('[data-action="title"]')?.addEventListener('click', () => this.engine.showView('MainMenu'));
            }
            menu.style.display = 'flex';
        } else {
            if (menu) menu.style.display = 'none';
        }
    }
}