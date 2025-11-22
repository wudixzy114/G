// src/game/scenes/MainScene.ts
import Phaser from 'phaser';
import {useGameWorkerStore} from '@/ui/stores/gameWorker';

/**
 * The MainScene is the primary game scene where the main game logic and rendering occur.
 * It interacts with the game worker store to get ECS snapshots and renders entities accordingly.
 */
export class MainScene extends Phaser.Scene {
    /**
     * Reference to the game worker store for accessing game state and snapshots.
     */
    private store: ReturnType<typeof useGameWorkerStore>;
    /**
     * A map to store Phaser GameObjects (Containers) for each entity, keyed by entity ID.
     * This allows for efficient updating and removal of entity representations.
     */
    private entitySprites: Map<string, Phaser.GameObjects.Container>; // ID -> Sprite 映射

    /**
     * Constructs a new MainScene.
     * Initializes the scene key, sets up the game worker store, and prepares the entity sprites map.
     */
    constructor() {
        super('MainScene');
        this.store = useGameWorkerStore();
        this.entitySprites = new Map();
    }

    /**
     * Called once, when the scene is created.
     * Performs initial setup, such as adding background elements or debug text.
     */
    create() {
        console.log('Phaser: MainScene started.');

        // 添加背景 (临时)
        this.add.text(10, 10, 'Phaser Layer Active', {color: '#0f0'});
    }

    /**
     * The main update loop for the scene, called every frame.
     * It retrieves the latest ECS snapshot from the store and updates the visual representation of entities.
     * Entities are created, updated, or destroyed based on the snapshot.
     * @param _time The current game time in milliseconds.
     * @param _delta The time elapsed since the last frame in milliseconds.
     */
    update(_time: number, _delta: number) {
        // 每一帧，从 Store 获取最新的 ECS 快照
        const snapshot = this.store.latestSnapshot;
        if (!snapshot) return;

        // 1. 遍历快照中的实体，创建或更新 Sprite
        const currentEntityIds = new Set<string>();

        snapshot.entities.forEach(entity => {
            // 只有带有 Position 组件的实体才需要渲染
            // 注意：这里假设我们在 ecs.ts 里加了 Position 定义，实际上我们之前只加了 Narrative
            // 临时演示：我们假设所有实体都在 (400, 300)
            // 实际开发需补全 PositionComponent

            currentEntityIds.add(entity.id);

            let spriteContainer = this.entitySprites.get(entity.id);

            // 如果没有 Sprite，创建它
            if (!spriteContainer) {
                spriteContainer = this.createEntitySprite(entity.id, entity.tags);
                this.entitySprites.set(entity.id, spriteContainer);
            }

            // 更新位置 (插值逻辑可以在这里做，让移动更平滑)
            // const pos = entity.components[ComponentType.Position] as IPositionComponent;
            // if (pos) {
            //   spriteContainer.x = pos.x;
            //   spriteContainer.y = pos.y;
            // }

            // 临时演示位置分散
            const pseudoHash = entity.id.charCodeAt(0) * 10;
            spriteContainer.setPosition(400 + (pseudoHash % 200), 300);
        });

        // 2. 清理已经消失的实体 (GC)
        for (const [id, sprite] of this.entitySprites) {
            if (!currentEntityIds.has(id)) {
                sprite.destroy();
                this.entitySprites.delete(id);
            }
        }
    }

    /**
     * Helper method to create the visual representation (Sprite Container) for an entity.
     * This includes a graphical shape and text based on the entity's tags.
     * @param _id The ID of the entity for which to create the sprite.
     * @param tags An array of tags associated with the entity, used for visual customization.
     * @returns A Phaser.GameObjects.Container representing the entity.
     */
    private createEntitySprite(_id: string, tags: string[]): Phaser.GameObjects.Container {
        const container = this.add.container(0, 0);

        // 简单的图形代替 Sprite
        const graphics = this.add.circle(0, 0, 10, 0xff0000);
        const text = this.add.text(0, -20, tags.join(','), {fontSize: '12px'}).setOrigin(0.5);

        if (tags.includes('Player')) {
            (graphics as any).setFillStyle(0x00ff00); // 玩家绿色
        }

        container.add([graphics, text]);
        return container;
    }
}