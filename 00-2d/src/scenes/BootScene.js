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
        this.scene.start('Nivel1Scene');
    }
}
