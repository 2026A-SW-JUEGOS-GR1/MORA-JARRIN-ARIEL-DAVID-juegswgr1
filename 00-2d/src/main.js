import { GAME_WIDTH, GAME_HEIGHT, GRAVITY_Y } from './config/constants.js';
import BootScene from './scenes/BootScene.js';
import Nivel1Scene from './scenes/Nivel1Scene.js';

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: '#5c94fc',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: GRAVITY_Y },
            debug: false
        }
    },
    scene: [BootScene, Nivel1Scene]
};

new Phaser.Game(config);
