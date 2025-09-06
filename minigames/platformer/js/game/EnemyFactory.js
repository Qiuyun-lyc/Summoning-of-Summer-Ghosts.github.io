//引入创建实体所需的各种模块和组件
import { GameObject } from '../core/GameObject.js';
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';
import { Animator } from '../components/Animator.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { HealthComponent } from '../components/HealthComponent.js';
import { EnemyAIController } from '../components/EnemyAIController.js';

// 工厂函数，用于创建特定类型的敌人
export function createSlime(assetManager, x, y) {
    const enemy = new GameObject('Enemy');
    enemy.addComponent(new Transform(x, y));
    const animations = {
        idle: assetManager.getSpriteSheet('idle'),
        walk: assetManager.getSpriteSheet('walk'),
    };
    const animator = enemy.addComponent(new Animator(animations));
    animator.play('walk');

    enemy.addComponent(new SpriteRenderer());
    enemy.addComponent(new Physics());
    enemy.addComponent(new HealthComponent(50));
    enemy.addComponent(new EnemyAIController({ type: 'patrol', speed: 1, patrolDistance: 100 }));
    
    return enemy;
}

// 创建光芒实体的工厂函数
export function createLightOrb(assetManager, x, y) {
    const orb = new GameObject('LightOrb');

    orb.addComponent(new Transform(x, y));

    const renderer = orb.addComponent(new SpriteRenderer());
    renderer.isStatic = true; 
    renderer.staticImage = assetManager.getImage('light_orb');

    const physics = orb.addComponent(new Physics({ gravity: 0 })); 
    physics.floatAmplitude = 3; 
    physics.floatSpeed = 0.02; 

    return orb;
}