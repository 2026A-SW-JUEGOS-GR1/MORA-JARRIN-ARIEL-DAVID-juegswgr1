import { FRAME_WIDTH, FRAME_HEIGHT } from '../config/constants.js';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        this.load.tilemapTiledJSON('map-nivel1', 'assets/maps/nivel1.json');
        this.load.image('tiles', 'assets/tilesets/spritesheet-tiles-default.png');
        this.load.spritesheet('nightwing', 'assets/sprites/Nightwing.png', {
            frameWidth:  FRAME_WIDTH,
            frameHeight: FRAME_HEIGHT
        });
    }

    create() {
        // Textura del patrullero (cuadrado rojo con ojos)
        const g1 = this.make.graphics({ x: 0, y: 0 }, false);
        g1.fillStyle(0xcc2222, 1);
        g1.fillRect(0, 0, 40, 40);
        g1.fillStyle(0xffffff, 1);
        g1.fillRect(8, 10, 8, 8);
        g1.fillRect(24, 10, 8, 8);
        g1.fillStyle(0x000000, 1);
        g1.fillRect(10, 12, 4, 4);
        g1.fillRect(26, 12, 4, 4);
        g1.generateTexture('enemy-patrol', 40, 40);
        g1.destroy();

        // Textura del perseguidor (cuadrado morado con cara enojada)
        const g2 = this.make.graphics({ x: 0, y: 0 }, false);
        g2.fillStyle(0x7722cc, 1);
        g2.fillRect(0, 0, 48, 48);
        g2.fillStyle(0xffffff, 1);
        g2.fillRect(10, 12, 10, 8);
        g2.fillRect(28, 12, 10, 8);
        g2.fillStyle(0x000000, 1);
        g2.fillRect(13, 14, 4, 4);
        g2.fillRect(31, 14, 4, 4);
        g2.fillStyle(0x000000, 1);
        g2.fillRect(12, 32, 24, 3);
        g2.generateTexture('enemy-chaser', 48, 48);
        g2.destroy();

        this.scene.start('MenuScene');
    }
}
