import { MOVE_SPEED, states } from '../constants.js';
import { Transform } from './Transform.js';
import { Physics } from './Physics.js';
import { StateMachine } from './StateMachine.js';

//负责接收输入并将其转换为玩家的行为
export class PlayerController {
    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.physics = this.gameObject.getComponent(Physics);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
    }
    
    update(deltaTime, input) {
        //将输入处理委托给玩家内部的行为状态机
        this.stateMachine.currentState.handleInput(input);
        //如果不在攻击状态。处理左右移动
        if (this.stateMachine.currentState.state !== states.ATTACK) {
             this.physics.velocityX = 0;
            if (input.keys.ArrowLeft && !input.keys.ArrowRight) {
                this.physics.velocityX = -MOVE_SPEED;
                this.transform.facingRight = false;
            } else if (input.keys.ArrowRight && !input.keys.ArrowLeft) {
                this.physics.velocityX = MOVE_SPEED;
                this.transform.facingRight = true;
            }
        }
    }
}