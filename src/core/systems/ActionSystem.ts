import {System} from '../ecs/System';
import {
    ComponentType,
    type INarrativeLogComponent,
    type IDescriptionComponent,
} from '@/shared/types/ecs';
import {Entity} from '../ecs/Entity';

/**
 * The ActionSystem processes player inputs and translates them into game actions.
 * It interacts with entities and their components to modify the game state based on player commands.
 */
export class ActionSystem extends System {
    /**
     * Updates the system logic on each game tick.
     * It consumes player inputs and dispatches them to appropriate handlers.
     * @param _deltaTime The time elapsed since the last update, in seconds (unused in this system).
     */
    update(_deltaTime: number): void {
        const inputs = this.world.consumeInputs();

        if (inputs.length === 0) return;

        // 假设单人游戏，直接找 Player 实体
        // 实际上应该根据 sessionId 或 input 里的 playerId 查找
        const player = this.world.queryEntities(e => e.tags.has('Player'))[0];
        const currentRoom = this.world.queryEntities(e => e.tags.has('CurrentRoom'))[0];

        if (!player) return;

        for (const input of inputs) {
            this.handleInput(input, player, currentRoom);
        }
    }

    /**
     * Handles a single player input, delegating to specific action handlers.
     * @param input The player input object containing the action and its payload.
     * @param player The player entity that initiated the action.
     * @param room The current room entity where the action is taking place (optional).
     * @private
     */
    private handleInput(input: { action: string, payload: any }, player: Entity, room?: Entity) {
        const {action} = input;

        switch (action) {
            case 'LOOK':
                this.handleLook(player, room);
                break;

            case 'OPEN_INVENTORY':
                this.handleInventory(player);
                break;

            // 这里可以扩展更多的动作，如 MOVE, ATTACK, TALK
            // case 'MOVE': ...
        }
    }

    /**
     * Handles the 'LOOK' action, providing a description of the current room to the player.
     * @param player The player entity.
     * @param room The current room entity.
     * @private
     */
    private handleLook(player: Entity, room?: Entity) {
        if (!room) {
            this.addLog(player, "周围一片虚无。", 'system');
            return;
        }

        // 获取房间的详细描述
        const desc = room.getComponent<IDescriptionComponent>(ComponentType.Description);
        if (desc) {
            // 添加到玩家日志
            this.addLog(player, desc.long, 'info');
        } else {
            this.addLog(player, "Nothing special.", 'info');
        }
    }

    /**
     * Handles the 'OPEN_INVENTORY' action, providing feedback about the player's inventory.
     * @param player The player entity.
     * @private
     */
    private handleInventory(player: Entity) {
        // 暂时写死，后续接 InventoryComponent
        this.addLog(player, "背包是空的。(功能开发中)", 'system');
    }

    /**
     * Adds a log entry to the player's narrative log component.
     * @param entity The entity whose narrative log will be updated (typically the player).
     * @param text The text content of the log entry.
     * @param type The type of the log entry (e.g., 'info', 'system', 'dialogue', 'combat').
     * @private
     */
    private addLog(entity: Entity, text: string, type: 'info' | 'system' | 'dialogue' | 'combat') {
        let logComp = entity.getComponent<INarrativeLogComponent>(ComponentType.NarrativeLog);
        if (logComp) {
            // 注意：这里直接修改了 Component 的引用对象
            // 因为我们是 Vue + RxDB 架构，
            // 下一帧 snapshot 发送给前端时，Vue 会检测到变化并更新 DOM
            logComp.history.push({
                id: Date.now().toString() + Math.random(),
                text,
                type,
                timestamp: Date.now()
            });

            // 限制日志长度
            if (logComp.history.length > 50) logComp.history.shift();
        }
    }
}