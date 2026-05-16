import { GAME_WIDTH, GAME_HEIGHT } from '../config/constants.js';

export default class Nivel2Scene extends Phaser.Scene {
    constructor() {
        super('Nivel2Scene');
    }

    create() {
        this.cameras.main.setBackgroundColor('#2d1b3d');

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'Nivel 2', {
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'En construcción (Estudiante B)', {
            fontSize: '24px',
            color: '#cccccc'
        }).setOrigin(0.5);

        this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Presiona M para volver al Menú', {
            fontSize: '18px',
            color: '#ffff00'
        }).setOrigin(0.5);

        this.input.keyboard.once('keydown-M', () => {
            this.scene.start('MenuScene');
        });
    }
}
