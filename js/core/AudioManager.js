export default class AudioManager {
    constructor() {
        this.bgmPlayer = document.getElementById('bgm-player');
        this.sfxHoverPlayer = document.getElementById('sfx-hover-player');
        this.sfxClickPlayer = document.getElementById('sfx-click-player');
        this.sfxTitleHoverPlayer = document.getElementById('sfx-title-hover-player');
        this.sfxTitleClickPlayer = document.getElementById('sfx-title-click-player');
        this.sfxSysYesPlayer = document.getElementById('sfx-sys-yes-player');

        this.voicePlayer = document.createElement('audio');
        this.voicePlayer.id = 'voice-player';
        document.body.appendChild(this.voicePlayer);
        this.currentVoice = '';

        this.currentBgm = '';
        this.volumes = {
            gameBgm: 0.5,
            sfx: 0.5,
            indexBgm: 0.5,
            voice: 1.0, 
        };
    }

    init() {
        this.volumes.gameBgm = parseFloat(localStorage.getItem('gameBgmVolume') || 0.5);
        this.volumes.indexBgm = parseFloat(localStorage.getItem('indexBgmVolume') || 0.5);
        this.volumes.sfx = parseFloat(localStorage.getItem('sfxVolume') || 0.5);
        this.volumes.voice = parseFloat(localStorage.getItem('voiceVolume') || 1.0);
        
        this.sfxHoverPlayer.src = './assets/bgm/holver.ogg';
        this.sfxClickPlayer.src = './assets/bgm/click.ogg';
        this.sfxTitleHoverPlayer.src = './assets/bgm/holver.ogg';
        this.sfxTitleClickPlayer.src = './assets/bgm/click.ogg';
        this.sfxSysYesPlayer.src = './assets/bgm/click.ogg';
        
        this.applyVolumes();
    }
    
    applyVolumes() {
        this.bgmPlayer.volume = this.bgmPlayer.dataset.isIndex === 'true' ? this.volumes.indexBgm : this.volumes.gameBgm;
        this.sfxHoverPlayer.volume = this.volumes.sfx;
        this.sfxClickPlayer.volume = this.volumes.sfx;
        this.sfxTitleHoverPlayer.volume = this.volumes.sfx;
        this.sfxTitleClickPlayer.volume = this.volumes.sfx;
        this.sfxSysYesPlayer.volume = this.volumes.sfx;
        this.voicePlayer.volume = this.volumes.voice;
    }
    
    setVolume(type, value) {
        const volume = parseFloat(value);
        if (isNaN(volume)) return; // 防止无效值

        if (type === 'gameBgm') {
            this.volumes.gameBgm = volume;
            localStorage.setItem('gameBgmVolume', volume);
        } else if (type === 'indexBgm') {
            this.volumes.indexBgm = volume;
            localStorage.setItem('indexBgmVolume', volume);
        } else if (type === 'sfx') {
            this.volumes.sfx = volume;
            localStorage.setItem('sfxVolume', volume);
        } else if (type === 'voice') {
            this.volumes.voice = volume;
            localStorage.setItem('voiceVolume', volume);
        }
        this.applyVolumes();
    }

    playBgm(src, isIndex = false) {
        if (this.currentBgm === src) return;

        this.currentBgm = src;
        this.bgmPlayer.src = src;
        this.bgmPlayer.dataset.isIndex = isIndex;
        this.bgmPlayer.volume = isIndex ? this.volumes.indexBgm : this.volumes.gameBgm;
        this.bgmPlayer.play().catch(e => console.warn("BGM自动播放被浏览器阻止。"));
    }
    
    stopBgm() {
        this.bgmPlayer.pause();
        this.currentBgm = '';
    }

    playVoice(src) {
        this.stopVoice();

        if (!src) return;

        this.currentVoice = src;
        this.voicePlayer.src = src;
        this.voicePlayer.play().catch(e => console.warn("语音自动播放被浏览器阻止。"));
    }

    stopVoice() {
        if (this.voicePlayer && !this.voicePlayer.paused) {
            this.voicePlayer.pause();
            this.voicePlayer.currentTime = 0;
        }
        this.currentVoice = '';
    }
    
    playSoundEffect(type) {
        let player;
        switch(type) {
            case 'hover': player = this.sfxHoverPlayer; break;
            case 'click': player = this.sfxClickPlayer; break;
            case 'titleHover': player = this.sfxTitleHoverPlayer; break;
            case 'titleClick': player = this.sfxTitleClickPlayer; break;
            case 'sysYes': player = this.sfxSysYesPlayer; break;
        }
        if (player) {
            player.currentTime = 0;
            player.play().catch(e => {});
        }
    }
}