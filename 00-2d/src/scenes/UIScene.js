import { INITIAL_LIVES } from '../config/constants.js';

export default class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        this.livesText = this.add.text(16, 16, '', {
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#00000099',
            padding: { x: 12, y: 6 }
        });

        this.scoreText = this.add.text(16, 60, 'Score: 0', {
            fontSize: '20px',
            color: '#ffff00',
            backgroundColor: '#00000099',
            padding: { x: 12, y: 6 }
        });

        this.add.text(16, 100, '← → mover | ↑/Espacio: salto (x2 en el aire) | M: menú', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#00000099',
            padding: { x: 8, y: 4 }
        });

        this.updateLives(INITIAL_LIVES);

        const reg = this.registry.events;

        this.scoreHandler = (score) => {
            this.scoreText.setText('Score: ' + score);
        };
        this.livesHandler = (lives) => {
            this.updateLives(lives);
        };

        reg.on('score-changed', this.scoreHandler);
        reg.on('lives-changed', this.livesHandler);

        this.events.once('shutdown', () => {
            reg.off('score-changed', this.scoreHandler);
            reg.off('lives-changed', this.livesHandler);
        });
    }

    updateLives(lives) {
        const hearts = '❤️'.repeat(Math.max(0, lives));
        const empty  = '🖤'.repeat(Math.max(0, INITIAL_LIVES - lives));
        this.livesText.setText('Vidas: ' + hearts + empty);
    }
}
