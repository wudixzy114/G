import Phaser from "phaser";

/**
 * The BootScene is responsible for loading initial assets and transitioning to the main game scene.
 * It displays a loading bar to indicate progress.
 */
export class BootScene extends Phaser.Scene {
    /**
     * Constructs a new BootScene.
     * Sets the scene key to 'BootScene'.
     */
    constructor() {
        super('BootScene');
    }

    /**
     * Preloads all necessary game assets, such as images, spritesheets, and audio.
     * It also sets up a progress bar to visualize the loading process.
     * Once loading is complete, it transitions to the 'MainScene'.
     */
    preload() {
        // 这里加载静态资源
        // this.load.image('player', '/assets/player.png');
        // this.load.image('tiles', '/assets/tiles.png');

        // 模拟加载进度条
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);

        this.load.on('progress', (value: number) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            console.log('Phaser: Assets loaded.');
            // 加载完成后跳转主场景
            this.scene.start('MainScene');
        });
    }
}