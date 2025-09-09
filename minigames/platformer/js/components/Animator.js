import { frameDelayByState, WALK_PRE_COUNT } from '../constants.js';

//负责管理实体的动画播放
export class Animator {
    constructor(animations) {
        this.animations = animations;     //存储所有动画数据（帧、尺寸）
        this.currentAnimationName = null; //当前播放的动画名称
        this.currentAnimation = null;     //当前播放的动画数据
        this.currentFrameIndex = 0;       //当前动画播放到第几帧
        this.frameTimer = 0;              //帧计时器，用于控制动画速度
    }

    //播放指定名称的动画
    play(name) {
        if (this.currentAnimationName === name) return; //如果已在播放该动画，则不重复执行
    
        this.currentAnimationName = name;
        this.currentAnimation = this.animations[name];
        this.currentFrameIndex = 0; //重置帧索引
        this.frameTimer = 0;        //重置计时器
    }

    //每帧更新动画逻辑
    update(deltaTime) {
    if (!this.currentAnimation) return;

    // 累积真实时间
    this.frameTimer += deltaTime;

    // 当前动画帧延迟（假设单位是毫秒）
    const delay = frameDelayByState[this.currentAnimationName];

    // 如果累计时间超过一帧的播放时间，就切换下一帧
    if (this.frameTimer >= delay) {
        this.frameTimer -= delay; // 这里用 -=，避免掉帧时丢失多余时间
        this.currentFrameIndex++;
    }
}
    
    //获取当前应该显示的动画帧（一个离屏canvas）
    getCurrentFrame() {
        const anim = this.currentAnimation;
        if (!anim) return null;
        //对行走动画做特殊处理（有起步动作和循环部分）
        if (this.currentAnimationName === 'walk') {
            const total = anim.frames.length;
            const pre = WALK_PRE_COUNT;
            const loop = total - pre;
            if (this.currentFrameIndex < pre) return anim.frames[this.currentFrameIndex];
            const loopIdx = (this.currentFrameIndex - pre) % loop;
            return anim.frames[pre + loopIdx];
        } else {
            //对其他动画使用简单的循环播放
            return anim.frames[this.currentFrameIndex % anim.frames.length];
        }
    }
    
    //获取动画帧的原始尺寸
    getFrameSize() {
        const anim = this.currentAnimation;
        if (!anim) return { w: 0, h: 0 };
        return { w: anim.frameWidth, h: anim.frameHeight };
    }

    //检查动画是否播放完毕
    isAnimationFinished() {
        if (!this.currentAnimation) return true;
        return this.currentFrameIndex >= this.currentAnimation.frames.length - 1;
    }
}