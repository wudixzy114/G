import { Entity } from './Entity';
import { System } from './System';
import type { EntityID, IWorldSnapshot } from '@/shared/types/ecs';

export class World {
    entities: Map<EntityID,Entity> = new Map();
    systems: System[] = [];
    tickCount: number = 0;

    constructor() {}

    addSystem(systemClass: new(world: World) => System) {
        const system = new systemClass(this);
        this.systems.push(system);
    }

    createEntity(id: EntityID): Entity{
        const entity = new Entity(id);
        this.entities.set(id, entity);
        return entity;
    }

    removeEntity(id: EntityID) {
        this.entities.delete(id);
    }

    update(deltaTime: number) {
        this.tickCount++;
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }

    getSnapshot(): IWorldSnapshot {
        const plainEntities = Array.from(this.entities.values()).map(e => e.toJSON());
        return {
            tick: this.tickCount,
            entities: plainEntities,
            globalState: {},
        };
    }

    queryEntities(filter: (e: Entity) => boolean): Entity[] {
        const result: Entity[] = [];
        for (const entity of this.entities.values()) {
            if (filter(entity)) {
                result.push(entity);
            }
        }
        return result;
    }
}

