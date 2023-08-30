// Constants for game scene
const GROUND_SPEED = 180;
const GROUND_WIDTH = 336;
const GROUND_HEIGHT = 112;
const PIPE_WIDTH = 52;
const MIN_PIPE_HEIGHT = 80;
const MAX_PIPE_HEIGHT = 200;
const PIPE_SPAWN_INTERVAL = 2000;
const PIPE_SPEED = 200;


class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // variables and settings
        this.isStarted = false;
        this.isGameOver = false;
        this.birdColor = "red";
        this.bird = null;
        this.grounds = null;
        this.pipes = null;
        this.score = 0;
        this.scoreGroup = null;
        this.pipeSpawnTimer = null;
        this.isAddedIntoDatabase = false;
        this.sounds = {};
    }

    init(data) {
        this.birdColor = data.birdColor;
    }

    preload() {
        // Nothing to do here, already loaded in preload scene
    }

    create() {
        this.createBackground();
        this.createGameReady();

        // audio
        this.sounds.die = this.sound.add('die');
        this.sounds.hit = this.sound.add('hit');
        this.sounds.swoosh = this.sound.add('swoosh');
        this.sounds.wing = this.sound.add('wing');

        // input (mouse or touch)
        this.input.on('pointerdown', this.handleOnPointerDown, this);
    }

    createBackground() {
        const background = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'background').setOrigin(0.5, 0.5);
        background.setScale(this.scale.width / background.width + 0.2, this.scale.height / background.height + 0.2);
        background.setName('background');
        background.setDepth(-1);
    }

    createGameReady() {
        const gameReady = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'gameready').setOrigin(0.5, 0.5);
        gameReady.setScale(1.4)
        gameReady.setName('gameready');
        gameReady.setDepth(1);
    }

    handleOnPointerDown() {
        if (!this.isStarted) {
            this.isStarted = true;
            this.startGame();
            this.children.getByName('gameready').destroy();
        }
        else {
            if (!this.isGameOver) {
                this.bird.setVelocityY(-300);
                this.sounds.wing.play();
            }
        }
    }

    startGame() {
        this.createGrounds();
        this.createBird();
        this.createPipes();
        this.createScoreGroup();
    }

    createGrounds() {
        this.grounds = this.add.group();

        const ground1 = this.physics.add.image(0, this.game.config.height, 'ground').setOrigin(0, 1);
        ground1.setDisplaySize(GROUND_WIDTH, GROUND_HEIGHT);
        ground1.body.setVelocityX(-GROUND_SPEED)

        const ground2 = this.physics.add.image(GROUND_WIDTH, this.game.config.height, 'ground').setOrigin(0, 1);
        ground2.setDisplaySize(GROUND_WIDTH, GROUND_HEIGHT);
        ground2.body.setVelocityX(-GROUND_SPEED);

        const ground3 = this.physics.add.image(2 * GROUND_WIDTH, this.game.config.height, 'ground').setOrigin(0, 1);
        ground3.setDisplaySize(GROUND_WIDTH, GROUND_HEIGHT);
        ground3.body.setVelocityX(-GROUND_SPEED);

        this.grounds.addMultiple([ground1, ground2, ground3]);
    }

    createBird() {
        this.bird = this.physics.add.sprite(100, this.game.config.height / 2, `${this.birdColor}bird-0`);
        this.bird.setCollideWorldBounds(true);
        this.bird.setScale(1.5);
        this.bird.setName('bird');
        this.bird.setDepth(5);
        this.bird.setGravityY(1000);
        this.bird.body.setCircle(15, 0, -2);
        this.bird.animationFrame = 0;
        this.bird.animationTimer = this.time.addEvent({
            delay: 100,
            callback: this.animateBird,
            callbackScope: this,
            loop: true
        });
    }

    animateBird() {
        if (this.isStarted) {
            this.bird.animationFrame = (this.bird.animationFrame + 1) % 3;
            this.bird.setTexture(`${this.birdColor}bird-${this.bird.animationFrame}`);
        }
    }

    createPipes() {
        this.pipes = this.add.group();
        this.pipeSpawnTimer = this.time.addEvent({
            delay: PIPE_SPAWN_INTERVAL,
            callback: this.spawnPipe,
            callbackScope: this,
            loop: true
        });
    }

    createScoreGroup() {
        this.scoreGroup = this.add.group();
        this.scoreGroup.setDepth(8);
        this.updateScoreImages();
    }

    updateScoreImages() {
        this.scoreGroup.clear(true, true);
        const scoreDigits = String(this.score).split('');

        const digitWidth = 20;
        for (let i = 0; i < scoreDigits.length; i++) {
            const digitImage = this.add.image(
                this.game.config.width / 2 - (scoreDigits.length - 1 - i) * (digitWidth + 5),
                40,
                scoreDigits[i]
            );
            digitImage.setDepth(8);

            this.scoreGroup.add(digitImage);
        }
    }


    spawnPipe() {
        const PIPI_START_X = this.game.config.width + 100;
        const pipeTopHeight = Math.floor(Math.random() * (MAX_PIPE_HEIGHT - MIN_PIPE_HEIGHT)) + MIN_PIPE_HEIGHT;
        const pipeBottomHeight = Math.floor(Math.random() * (MAX_PIPE_HEIGHT - MIN_PIPE_HEIGHT)) + MIN_PIPE_HEIGHT;

        const pipeTop = this.physics.add.image(PIPI_START_X, 0, 'pipe').setOrigin(0.5, 0);
        pipeTop.setFlipY(true);
        pipeTop.setDepth(1);
        pipeTop.setDisplaySize(PIPE_WIDTH, pipeTopHeight);
        pipeTop.marked = false;
        pipeTop.isTopPipe = true;
        pipeTop.body.setVelocityX(-PIPE_SPEED);


        const pipeBottom = this.physics.add.image(PIPI_START_X, this.game.config.height - GROUND_HEIGHT, 'pipe').setOrigin(0.5, 1);
        pipeBottom.setDepth(1);
        pipeBottom.isTopPipe = false;
        pipeBottom.setDisplaySize(PIPE_WIDTH, pipeBottomHeight);
        pipeBottom.body.setVelocityX(-PIPE_SPEED);

        // add to group
        this.pipes.addMultiple([pipeTop, pipeBottom]);
    }

    createGameOver() {
        let gameOver = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'gameover').setOrigin(0.5, 0.5);
        gameOver.setScale(1.4)
        gameOver.setName('gameover');
        gameOver.setDepth(6);

        if (!this.isAddedIntoDatabase) {
            this.isAddedIntoDatabase = true;

            // Add score to GameFuse database
            let lastScore = GameFuseUser.CurrentUser.getAttributeValue("Score");
            lastScore = Number(lastScore)
            if (lastScore < this.score) {
                GameFuseUser.CurrentUser.setAttribute("Score", `${this.score}`, function (message, hasError) {
                    if (hasError) {
                        console.log("Error setting attribute: " + message);
                    }
                    else {
                        console.log("Attribute set successfully");
                    }
                });

                if (this.score > 100) {
                    GameFuseUser.CurrentUser.setAttribute("IsPassed100Points", "true", function (message, hasError) {
                        if (hasError) {
                            console.log("Error setting attribute: " + message);
                        }
                        else {
                            console.log("Attribute set successfully");
                        }
                    });
                }
                if (this.score > 200) {
                    GameFuseUser.CurrentUser.setAttribute("IsPassed200Points", "true", function (message, hasError) {
                        if (hasError) {
                            console.log("Error setting attribute: " + message);
                        }
                        else {
                            console.log("Attribute set successfully");
                        }
                    });
                }
            }

            let self = this;
            GameFuseUser.CurrentUser.addLeaderboardEntry("GameLeaderboard", Number(this.score), [], function (message, hasError) {
                if (hasError) {
                    console.log("Error adding leaderboard entry: " + message);
                }
                else {
                    console.log("Leaderboard entry added successfully");

                    let menu = document.getElementById('menu');
                    menu.style.display = 'flex';
                    let mainMenu = document.getElementById('mainMenu');
                    mainMenu.style.display = 'flex';

                    self.game.destroy(true, false);
                }
            });
        }
    }

    update() {
        if (this.isStarted) {
            if (this.bird.body.velocity.y > 300) {
                let angle = this.bird.angle + 30;
                if (angle <= 90)
                    this.bird.setAngle(angle);
            }
            else if (this.bird.body.velocity.y > 0) {
                this.bird.setAngle(0);
            }
            else {
                this.bird.setAngle(-30);
            }

            if (this.score > 0) {
                this.pipeSpawnTimer.delay = 1800;
            }
            else if (this.score > 20) {
                this.pipeSpawnTimer.delay = 1000;
            }
            else if (this.score > 50) {
                this.pipeSpawnTimer.delay = 500;
            }

            this.updateGrounds();
            this.updatePipes();

            this.physics.add.overlap(this.bird, this.grounds, this.handleBirdBaseCollision, null, this);
            this.physics.add.overlap(this.bird, this.pipes, this.handleBirdPipeCollision, null, this);
        }
    }

    updateGrounds() {
        this.grounds.getChildren().forEach(ground => {
            if (ground.getBounds().right < 0) {
                ground.x = ground.x + ground.width * this.grounds.getLength();
            }
        });
    }

    updatePipes() {
        this.pipes.getChildren().forEach(pipe => {
            if (pipe.getBounds().right < 0) {
                pipe.destroy();
            }
            if (pipe.isTopPipe && pipe.getBounds().right < this.bird.getBounds().left && !pipe.marked) {
                pipe.marked = true;
                this.score++;
                this.sounds.swoosh.play();
                this.updateScoreImages();
            }
        });
    }

    handleBirdPipeCollision() {
        if (!this.isGameOver) {
            this.sounds.hit.play();
        }

        this.isGameOver = true;
        this.pipeSpawnTimer.paused = true;

        this.pipes.getChildren().forEach(pipe => {
            pipe.body.setVelocityX(0);
        });
        this.grounds.getChildren().forEach(ground => {
            ground.body.setVelocityX(0);
        });
    }

    handleBirdBaseCollision() {
        if (!this.isGameOver) {
            this.sounds.die.play();
        }

        this.input.off('pointerdown', this.handleOnPointerDown, this);
        this.isGameOver = true;
        this.physics.pause();
        this.pipeSpawnTimer.paused = true;
        this.bird.animationTimer.paused = true;

        this.createGameOver();
    }
}

export default GameScene;
