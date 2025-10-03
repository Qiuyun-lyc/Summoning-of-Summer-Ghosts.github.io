import { GameObject } from '../core/GameObject.js';
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';
import { Animator } from '../components/Animator.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { HealthComponent } from '../components/HealthComponent.js';
import { EnemyAIController } from '../components/EnemyAIController.js';

export function createGarpede(assetManager, x, y) {
    const config = {
        speed: 0.8,
        patrolDistance: 520,
        health: 50,
    };

    const frameDelays = {
        walk: 8, 
        turn: 10,
        death: 12,
    };

    const enemy = new GameObject('Enemy');
    
    enemy.addComponent(new Transform(x, y));
    
    const animations = {
        walk: assetManager.getSpriteSheet('garpede_walk'),
        turn: assetManager.getSpriteSheet('garpede_turn'),
        death: assetManager.getSpriteSheet('garpede_death'),
    };
    enemy.addComponent(new Animator(animations, frameDelays));
    enemy.addComponent(new SpriteRenderer());
    enemy.addComponent(new Physics());
    enemy.addComponent(new HealthComponent(config.health));
    enemy.addComponent(new EnemyAIController(config));
    
    return enemy;
}

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