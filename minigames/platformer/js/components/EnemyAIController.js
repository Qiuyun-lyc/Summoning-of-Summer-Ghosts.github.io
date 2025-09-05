import { Transform } from './Transform.js';
import { Physics } from './Physics.js';
import { Animator } from './Animator.js';

//定义了敌人的行为逻辑
export class EnemyAIController {
    constructor(config) {
        this.type = config.type || 'patrol';                //AI类型，默认为巡逻
        this.speed = config.speed || 1;                     //移动速度
        this.patrolDistance = config.patrolDistance || 100; //巡逻距离
        this.startPatrolX = 0;                              //巡逻起始点X坐标
        this.direction = 1;                                 //移动方向（1为右，-1为左）
    }

    //初始化，获取对其他组件的引用
    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.physics = this.gameObject.getComponent(Physics);
        this.animator = this.gameObject.getComponent(Animator);
        this.startPatrolX = this.transform.x;
    }

    //每帧更新AI逻辑
    update(deltaTime) {
        if (this.type === 'patrol') {
            this.patrol();
        }
    }
    
    //巡逻行为
    patrol() {
        //设置物理组件的速度
        this.physics.velocityX = this.speed * this.direction;
        //到达巡逻中点时反向
        if (this.direction === 1 && this.transform.x >= this.startPatrolX + this.patrolDistance) {
            this.direction = -1;
            this.transform.facingRight = false;
        } else if (this.direction === -1 && this.transform.x <= this.startPatrolX) {
            //到达巡逻起点时反向
            this.direction = 1;
            this.transform.facingRight = true;
        }
        //根据速度播放相应的动画
        if (this.physics.velocityX !== 0) {
            this.animator.play('walk');
        } else {
            this.animator.play('idle');
        }
    }
}