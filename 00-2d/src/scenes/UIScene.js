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

        this.add.text(16, 100, '← → mover | ↑/Espacio: salto (x2) | Shift: dash | M: menú', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#00000099',
            padding: { x: 8, y: 4 }
        });

        this.dashText = this.add.text(16, 130, 'DASH: LISTO', {
            fontSize: '14px',
            color: '#66ccff',
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
        this.dashReadyHandler = (ready) => {
            if (ready) {
                this.dashText.setText('DASH: LISTO');
                this.dashText.setColor('#66ccff');
            } else {
                this.dashText.setText('DASH: ⏳');
                this.dashText.setColor('#888888');
            }
        };

        reg.on('score-changed', this.scoreHandler);
        reg.on('lives-changed', this.livesHandler);
        reg.on('dash-ready',    this.dashReadyHandler);

        this.events.once('shutdown', () => {
            reg.off('score-changed', this.scoreHandler);
            reg.off('lives-changed', this.livesHandler);
            reg.off('dash-ready',    this.dashReadyHandler);
        });
    }

    updateLives(lives) {
        const hearts = '❤️'.repeat(Math.max(0, lives));
        const empty  = '🖤'.repeat(Math.max(0, INITIAL_LIVES - lives));
        this.livesText.setText('Vidas: ' + hearts + empty);
    }
}
