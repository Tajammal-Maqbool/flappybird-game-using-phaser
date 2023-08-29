class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });

        this.birdColor = null;
    }

    init(data) {
        this.birdColor = data.bird;
    }

    preload() {
        // general sprites
        this.load.image('background', '/sprites/background.png');
        this.load.image('ground', '/sprites/ground.png');
        this.load.image('gameready', '/sprites/gameready.png');
        this.load.image('pipe', '/sprites/pipe.png');
        this.load.image('gameover', '/sprites/gameover.png');

        // digits sprites
        this.load.image('0', '/sprites/0.png');
        this.load.image('1', '/sprites/1.png');
        this.load.image('2', '/sprites/2.png');
        this.load.image('3', '/sprites/3.png');
        this.load.image('4', '/sprites/4.png');
        this.load.image('5', '/sprites/5.png');
        this.load.image('6', '/sprites/6.png');
        this.load.image('7', '/sprites/7.png');
        this.load.image('8', '/sprites/8.png');
        this.load.image('9', '/sprites/9.png');

        // birds sprites
        this.load.image('bluebird-0', '/sprites/bluebird-downflap.png');
        this.load.image('bluebird-1', '/sprites/bluebird-midflap.png');
        this.load.image('bluebird-2', '/sprites/bluebird-upflap.png');

        this.load.image('redbird-0', '/sprites/redbird-downflap.png');
        this.load.image('redbird-1', '/sprites/redbird-midflap.png');
        this.load.image('redbird-2', '/sprites/redbird-upflap.png');

        this.load.image('yellowbird-0', '/sprites/yellowbird-downflap.png');
        this.load.image('yellowbird-1', '/sprites/yellowbird-midflap.png');
        this.load.image('yellowbird-2', '/sprites/yellowbird-upflap.png');

        // audio
        this.load.audio('die', '/audio/die.wav');
        this.load.audio('hit', '/audio/hit.wav');
        this.load.audio('point', '/audio/point.wav');
        this.load.audio('swoosh', '/audio/swoosh.wav');
        this.load.audio('wing', '/audio/wing.wav');
    }

    create() {
        // add background
        var background = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'background').setOrigin(0.5, 0.5);
        background.setScale(this.scale.width / background.width + 0.2, this.scale.height / background.height + 0.2);


        this.scene.start('GameScene', {
            birdColor: this.birdColor
        });
    }

    update() {
        // Nothing to do here
    }
}

export default PreloadScene;