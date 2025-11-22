import {System} from "@/core/ecs/System.ts";
import {ComponentType, type INarrativeLogComponent, type LogEntry} from "@/shared/types/ecs.ts";

export class NarrativeSystem extends System {
    update(_deltaTime: number): void {

    }

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