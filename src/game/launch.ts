import Phaser from "phaser";
import {BootScene} from "./scenes/BootScene";
import {MainScene} from "./scenes/MainScene";

/**
 * Launches the Phaser game instance.
 * This function initializes the Phaser game with a predefined configuration and attaches it to a specified DOM element.
 * @param containerId The ID of the DOM element where the game canvas will be appended.
 * @returns The initialized Phaser Game instance.
 */
export function launchGame(containerId: string) {
    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: containerId,
        width: 800,
        height: 600,
        backgroundColor: '#000000',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: {x: 0, y: 0}, // 俯视角 RPG 不需要重力
                debug: import.meta.env.DEV // 开发模式显示碰撞框
            }
        },
        scene: [BootScene, MainScene],
        scale: {
            mode: Phaser.Scale.RESIZE, // 自适应容器大小
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };

    return new Phaser.Game(config);
}