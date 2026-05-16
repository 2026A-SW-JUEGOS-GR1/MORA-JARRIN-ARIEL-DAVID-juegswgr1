import {
    COLLECTIBLE_TILE,
    PLAYER_SPEED,
    JUMP_VELOCITY,
    DOUBLE_JUMP_VELOCITY,
    MAX_JUMPS,
    DASH_VELOCITY,
    DASH_DURATION_MS,
    DASH_COOLDOWN_MS,
    DASH_TINT,
    INITIAL_LIVES,
    SCORE_PER_COLLECTIBLE
} from '../config/constants.js';

export default class Nivel1Scene extends Phaser.Scene {
    constructor() {
        super('Nivel1Scene');
    }

    create() {
        // ── Estado inicial ──
        this.score = 0;
        this.lives = INITIAL_LIVES;
        this.registry.events.emit('score-changed', this.score);
        this.registry.events.emit('lives-changed', this.lives);
        this.registry.events.emit('dash-ready', true);

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

        // ── Doble salto ──
        this.jumpsUsed = 0;

        const g = this.make.graphics({ x: 0, y: 0 }, false);
        g.fillStyle(0xffffff, 1);
        g.fillCircle(4, 4, 4);
        g.generateTexture('jumpParticle', 8, 8);
        g.destroy();

        this.doubleJumpFx = this.add.particles(0, 0, 'jumpParticle', {
            speed:    { min: 80, max: 160 },
            angle:    { min: 250, max: 290 },
            scale:    { start: 1, end: 0 },
            alpha:    { start: 1, end: 0 },
            lifespan: 400,
            quantity: 12,
            tint:     0x00ffff,
            emitting: false
        });

        // ── Dash ──
        this.isDashing   = false;
        this.canDash     = true;
        this.facingRight = true;

        // ── Animaciones (guard evita error al re-entrar al nivel) ──
        if (!this.anims.exists('idle')) {
            this.anims.create({
                key: 'idle',
                frames: [{ key: 'nightwing', frame: 0 }],
                frameRate: 1,
                repeat: -1
            });
        }

        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('nightwing', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.anims.exists('jump')) {
            this.anims.create({
                key: 'jump',
                frames: [{ key: 'nightwing', frame: 3 }],
                frameRate: 1
            });
        }

        // ── Cámara ──
        this.cameras.main.setBounds(0, 0, this.mapa.widthInPixels, this.mapa.heightInPixels);
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        // ── Controles ──
        this.cursors  = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // ── UIScene en paralelo ──
        this.scene.launch('UIScene');

        // ── Tecla M: volver al menú ──
        this.input.keyboard.on('keydown-M', () => {
            this.scene.stop('UIScene');
            this.scene.start('MenuScene');
        });

        // ── Tecla L: perder vida (test) ──
        this.input.keyboard.on('keydown-L', () => {
            this.loseLife();
        });
    }

    update() {
        const body     = this.player.body;
        const onGround = body.blocked.down || body.touching.down;

        // Resetear contador de saltos al aterrizar
        if (onGround) {
            this.jumpsUsed = 0;
        }

        // ── Movimiento horizontal (bloqueado durante dash) ──
        if (this.cursors.left.isDown) {
            if (!this.isDashing) this.player.setVelocityX(-PLAYER_SPEED);
            this.facingRight = false;
            this.player.setFlipX(true);
            if (onGround) this.player.anims.play('walk', true);

        } else if (this.cursors.right.isDown) {
            if (!this.isDashing) this.player.setVelocityX(PLAYER_SPEED);
            this.facingRight = true;
            this.player.setFlipX(false);
            if (onGround) this.player.anims.play('walk', true);

        } else {
            if (!this.isDashing) this.player.setVelocityX(0);
            if (onGround) this.player.anims.play('idle', true);
        }

        // ── Salto (detección por flanco) ──
        const justJump =
            Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey);

        if (justJump && this.jumpsUsed < MAX_JUMPS) {
            if (this.jumpsUsed === 0) {
                this.player.setVelocityY(JUMP_VELOCITY);
            } else {
                this.player.setVelocityY(DOUBLE_JUMP_VELOCITY);
                this.emitDoubleJumpFx();
            }
            this.jumpsUsed += 1;
            this.player.anims.play('jump', true);
        }

        // ── Dash ──
        if (Phaser.Input.Keyboard.JustDown(this.shiftKey) && this.canDash && !this.isDashing) {
            this.startDash();
        }

        this.checkCollectibleOverlap();
    }

    emitDoubleJumpFx() {
        this.doubleJumpFx.emitParticleAt(this.player.x, this.player.y + 30);
    }

    startDash() {
        this.isDashing = true;
        this.canDash   = false;
        this.registry.events.emit('dash-ready', false);

        const dir = this.facingRight ? 1 : -1;
        this.player.setVelocityX(DASH_VELOCITY * dir);
        this.player.setVelocityY(0);
        this.player.body.setAllowGravity(false);
        this.player.setTint(DASH_TINT);

        this.spawnAfterimages();

        this.time.delayedCall(DASH_DURATION_MS, () => this.endDash());

        this.time.delayedCall(DASH_COOLDOWN_MS, () => {
            this.canDash = true;
            this.registry.events.emit('dash-ready', true);
        });
    }

    endDash() {
        this.isDashing = false;
        this.player.body.setAllowGravity(true);
        this.player.clearTint();
    }

    spawnAfterimages() {
        const interval = DASH_DURATION_MS / 4;
        for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * interval, () => {
                if (!this.isDashing) return;
                const ghost = this.add.sprite(this.player.x, this.player.y, 'nightwing', this.player.frame.name);
                ghost.setFlipX(this.player.flipX);
                ghost.setScale(this.player.scaleX, this.player.scaleY);
                ghost.setTint(DASH_TINT);
                ghost.setAlpha(0.5);
                this.tweens.add({
                    targets:    ghost,
                    alpha:      0,
                    duration:   250,
                    onComplete: () => ghost.destroy()
                });
            });
        }
    }

    loseLife() {
        this.lives -= 1;
        this.registry.events.emit('lives-changed', this.lives);

        if (this.lives <= 0) {
            this.gameOver();
        } else {
            this.player.setVelocity(0, 0);
            this.player.setPosition(100, 460);
            this.jumpsUsed = 0;
            this.isDashing = false;
            this.canDash   = true;
            this.player.body.setAllowGravity(true);
            this.player.clearTint();
            this.registry.events.emit('dash-ready', true);
        }
    }

    gameOver() {
        this.scene.stop('UIScene');
        this.scene.start('GameOverScene', { score: this.score, from: 'Nivel1Scene' });
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
                    this.score += SCORE_PER_COLLECTIBLE;
                    this.registry.events.emit('score-changed', this.score);
                    this.placeRandomTilesAboveBlocks(1, [{ x, y }]);
                    console.log('[Coleccionable] Tomado en:', { x, y }, '| Total:', this.score);
                    return;
                }
            }
        }
    }
}
