export const GRAVITY = 0.1;
export const MOVE_SPEED = 3; 
export const JUMP_POWER = 5;
//玩家渲染的目标高度
export const TARGET_H = 120; 
//行走动画中前三帧为非循环起步动画
export const WALK_PRE_COUNT = 3;
//玩家状态枚举
export const states = {
    IDLE: 0,
    WALK: 1,
    JUMP: 2,
    FALL: 3,
    LAND: 4,
    ATTACK: 5,
};
//玩家不同状态帧延迟
export const frameDelayByState = {
    idle: 15,
    walk: 10,
    jump: 12,
    fall: 12,
    land: 5,
    attack: 4,
};