//创建玩家所需的跟中模块和组件
import { GameObject } from '../core/GameObject.js';
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';
import { PlayerController } from '../components/PlayerController.js';
import { Animator } from '../components/Animator.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { StateMachine } from '../components/StateMachine.js';
import { IdleState, WalkState, JumpState, FallState, LandState, AttackState } from './playerStates.js';
import { states } from '../constants.js';
import { HealthComponent } from '../components/HealthComponent.js';

//工厂函数，用于创建玩家对象
export function createPlayer(assetManager) {
    //创建一个新的GameObject实例
    const player = new GameObject('Player');
    //添加玩家组件
    player.addComponent(new Transform(50, 1100));
    player.addComponent(new HealthComponent(100));
    //定义玩家的所有动画
    const animations = {
        idle: assetManager.getSpriteSheet('idle'),
        walk: assetManager.getSpriteSheet('walk'),
        jump: assetManager.getSpriteSheet('jump'),
        fall: assetManager.getSpriteSheet('fall'),
        land: assetManager.getSpriteSheet('land'),
        attack: assetManager.getSpriteSheet('attack'),
    };
    player.addComponent(new Animator(animations));//动画组件
    //创建渲染组件，并传入攻击特效的图片
    const slashFrame = assetManager.getImage('slash');
    player.addComponent(new SpriteRenderer(slashFrame));
    player.addComponent(new Physics());//物理组件
    //创建并配置玩家的行为状态机
    const stateMachine = player.addComponent(new StateMachine());
    stateMachine.addState(states.IDLE, new IdleState(player));
    stateMachine.addState(states.WALK, new WalkState(player));
    stateMachine.addState(states.JUMP, new JumpState(player));
    stateMachine.addState(states.FALL, new FallState(player));
    stateMachine.addState(states.LAND, new LandState(player));
    stateMachine.addState(states.ATTACK, new AttackState(player));
    //添加玩家输入控制器组件
    player.addComponent(new PlayerController());
    //设置玩家的初始状态为下落
    stateMachine.setState(states.IDLE);
    //返回组装好的玩家对象
    return player;
}