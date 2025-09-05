//引入创建敌人所需的各种模块和组件
import { GameObject } from '../core/GameObject.js';
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';
import { Animator } from '../components/Animator.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { HealthComponent } from '../components/HealthComponent.js';
import { EnemyAIController } from '../components/EnemyAIController.js';

//工厂函数，用于创建特定类型的敌人
export function createSlime(assetManager, x, y) {
    //创建一个新的GameObject实例，命名为Enemy
    const enemy = new GameObject('Enemy');
    //为敌人添加必要的组件，组装成一个完整的实体
    enemy.addComponent(new Transform(x, y));
    //定义敌人所需的动画
    const animations = {
        idle: assetManager.getSpriteSheet('idle'),
        walk: assetManager.getSpriteSheet('walk'),
    };
    const animator = enemy.addComponent(new Animator(animations));//动画组件
    animator.play('walk');//默认播放行走动画

    enemy.addComponent(new SpriteRenderer());   //渲染组件
    enemy.addComponent(new Physics());          //物理组件     
    enemy.addComponent(new HealthComponent(50));//生命组件
    enemy.addComponent(new EnemyAIController({ type: 'patrol', speed: 1, patrolDistance: 100 }));//AI行为组件，配置为巡逻模式
    
    return enemy;
}
