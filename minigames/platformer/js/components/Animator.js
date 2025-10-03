import { frameDelayByState, WALK_PRE_COUNT } from '../constants.js';

export class Animator {
    constructor(animations, frameDelays = {}) {
        this.animations = animations;
        this.frameDelays = frameDelays;
        this.currentAnimationName = null;
        this.currentAnimation = null;
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
    }

    play(name) {
        if (this.currentAnimationName === name) return; 
    
        this.currentAnimationName = name;
        this.currentAnimation = this.animations[name];
        this.currentFrameIndex = 0;
        this.frameTimer = 0;
    }

    update(deltaTime) { 
        if (!this.currentAnimation) return;

        this.frameTimer++;
        const delay = this.frameDelays[this.currentAnimationName] || frameDelayByState[this.currentAnimationName] || 10;
        
        if (this.frameTimer >= delay) {
            this.frameTimer = 0;
            this.currentFrameIndex++;
        }
    }
    
    getCurrentFrame() {
        const anim = this.currentAnimation;
        if (!anim) return null;

        if (this.currentAnimationName === 'walk' && anim.frames.length > WALK_PRE_COUNT) {
            const total = anim.frames.length;
            const pre = WALK_PRE_COUNT;
            const loop = total - pre;
            if (this.currentFrameIndex < pre) return anim.frames[this.currentFrameIndex];
            const loopIdx = (this.currentFrameIndex - pre) % loop;
            return anim.frames[pre + loopIdx];
        } else {
            const isNonLooping = ['death', 'turn', 'land', 'attack'].includes(this.currentAnimationName);
            if (isNonLooping) {
                const frameIndex = Math.min(this.currentFrameIndex, anim.frames.length - 1);
                return anim.frames[frameIndex];
            }
            return anim.frames[this.currentFrameIndex % anim.frames.length];
        }
    }
    
    getFrameSize() {
        const anim = this.currentAnimation;
        if (!anim) return { w: 0, h: 0 };
        return { w: anim.frameWidth, h: anim.frameHeight };
    }

    isAnimationFinished() {
        if (!this.currentAnimation) return true;
        return this.currentFrameIndex >= this.currentAnimation.frames.length;
    }
}