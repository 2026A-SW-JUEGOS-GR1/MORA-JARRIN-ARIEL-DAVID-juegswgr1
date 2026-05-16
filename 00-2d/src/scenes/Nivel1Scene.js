import {
    COLLECTIBLE_TILE,
    PLAYER_SPEED,
    JUMP_VELOCITY
} from '../config/constants.js';

export default class Nivel1Scene extends Phaser.Scene {
    constructor() {
        super('Nivel1Scene');
    }

    create() {
        // ── Tilemap ──
        this.mapa = this.make.tilemap({ key: 'map-nivel1' });

        const tileset1 = this.mapa.addTilesetImage('background',                'tiles');
        const tileset2 = this.mapa.addTilesetImage('spritesheet-tiles-default', 'tiles');

        this.capaSuelo = this.mapa.createLayer('Capa de patrones 1', [tileset1, tileset2], 0, 0);
        this.capaSuelo.setCollisionByExclusion([-1, COLLECTIBLE_TILE]);

        // ── Coleccionables ──
        this.startTileX = Math.floor(100 / this.mapa.tileWidth);
        this.startTileY = Math.floor(460 / this.mapa.tileHeight);
        this.placeRandomTilesAboveBlocks(3);

        // ── Jugador ──
        this.player = this.physics.add.sprite(100, 460, 'nightwing');
        this.player.setCollideWorldBounds(true);
        this.player.setBounce(0.05);
        this.player.setScale(1.5);

        this.physics.add.collider(this.player, this.capaSuelo);

        // ── Animaciones ──
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'nightwing', frame: 0 }],
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('nightwing', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: [{ key: 'nightwing', frame: 3 }],
            frameRate: 1
        });

        // ── Cámara ──
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // ── Controles ──
        this.cursors  = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ── HUD ──
        this.add.text(16, 16, '← → : mover  |  ↑ / Espacio : saltar', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#00000099',
            padding: { x: 8, y: 4 }
        }).setScrollFactor(0);

        this.score     = 0;
        this.scoreText = this.add.text(16, 48, 'Coleccionables: 0', {
            fontSize: '16px',
            fill: '#ffff00',
            backgroundColor: '#00000099',
            padding: { x: 8, y: 4 }
        }).setScrollFactor(0);
    }

    update() {
        const onGround = this.player.body.blocked.down;

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-PLAYER_SPEED);
            this.player.setFlipX(true);
            if (onGround) this.player.anims.play('walk', true);

        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(PLAYER_SPEED);
            this.player.setFlipX(false);
            if (onGround) this.player.anims.play('walk', true);

        } else {
            this.player.setVelocityX(0);
            if (onGround) this.player.anims.play('idle', true);
        }

        if ((this.cursors.up.isDown || this.spaceKey.isDown) && onGround) {
            this.player.setVelocityY(JUMP_VELOCITY);
            this.player.anims.play('jump', true);
        }

        this.checkCollectibleOverlap();
    }

    placeRandomTilesAboveBlocks(count = 1, exclude = []) {
        const candidates = [];

        for (let x = 0; x < this.mapa.width; x++) {
            for (let y = 0; y < this.mapa.height - 1; y++) {
                const tileAbove = this.capaSuelo.getTileAt(x, y);
                const tileBelow = this.capaSuelo.getTileAt(x, y + 1);
                const excluded  = exclude.some(pos => pos.x === x && pos.y === y);

                if (
                    !tileAbove &&
                    tileBelow &&
                    tileBelow.index !== -1 &&
                    tileBelow.index !== COLLECTIBLE_TILE &&
                    !(x === this.startTileX && y === this.startTileY - 1) &&
                    !excluded
                ) {
                    candidates.push({ x, y });
                }
            }
        }

        Phaser.Utils.Array.Shuffle(candidates);
        candidates.slice(0, count).forEach(({ x, y }) => {
            this.capaSuelo.putTileAt(COLLECTIBLE_TILE, x, y);
        });
    }

    checkCollectibleOverlap() {
        if (!this.capaSuelo || !this.player) return;

        const bounds = this.player.getBounds();
        const x1 = this.mapa.worldToTileX(bounds.left);
        const y1 = this.mapa.worldToTileY(bounds.top);
        const x2 = this.mapa.worldToTileX(bounds.right);
        const y2 = this.mapa.worldToTileY(bounds.bottom);

        for (let x = x1; x <= x2; x++) {
            for (let y = y1; y <= y2; y++) {
                const tile = this.capaSuelo.getTileAt(x, y);

                if (tile?.index === COLLECTIBLE_TILE) {
                    this.capaSuelo.removeTileAt(x, y);
                    this.score += 1;
                    this.scoreText.setText('Coleccionables: ' + this.score);
                    this.placeRandomTilesAboveBlocks(1, [{ x, y }]);
                    console.log('[Coleccionable] Tomado en:', { x, y }, '| Total:', this.score);
                    return;
                }
            }
        }
    }
}
