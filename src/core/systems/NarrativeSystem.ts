import {System} from "@/core/ecs/System.ts";
import {ComponentType, type INarrativeLogComponent, type LogEntry} from "@/shared/types/ecs.ts";

/**
 * Manages the narrative log for entities.
 */
export class NarrativeSystem extends System {
    /**
     * This system does not have a per-frame update logic.
     * @param _deltaTime The time elapsed since the last update, in seconds.
     */
    update(_deltaTime: number): void {

    }

    /**
     * Adds a log entry to an entity's narrative log.
     * @param entityId The ID of the entity.
     * @param text The text of the log entry.
     * @param type The type of the log entry.
     */
    addLog(entityId: string, text: string, type: LogEntry['type'] = 'info') {
        const entity = this.world.entities.get(entityId);
        if (!entity) return;
        let logComp = entity.getComponent<INarrativeLogComponent>(ComponentType.NarrativeLog);
        if (!logComp) {
            entity.addComponent({
                _type: ComponentType.NarrativeLog,
                history: []
            });

            logComp = entity.getComponent<INarrativeLogComponent>(ComponentType.NarrativeLog);
        }

        if (logComp) {
            logComp.history.push({
                id: Date.now().toString() + Math.random(),
                text,
                type,
                timestamp: Date.now()
            });

            if (logComp.history.length > 50) {
                logComp.history.shift();
            }
        }
    }
}