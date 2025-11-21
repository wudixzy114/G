import {Entity} from './Entity';
import {System} from './System';
import type {EntityID, IWorldSnapshot} from '@/shared/types/ecs';

/**
 * @description 世界
 */
export class World {
    /**
     * @description 实体列表
     */
    entities: Map<EntityID, Entity> = new Map();
    /**
     * @description 系统列表
     */
    systems: System[] = [];
    /**
     * @description 游戏刻
     */
    tickCount: number = 0;

    constructor() {
    }

    /**
     * @description 添加系统
     * @param systemClass
     */
    addSystem(systemClass: new (world: World) => System) {
        const system = new systemClass(this);
        this.systems.push(system);
    }

    /**
     * @description 创建实体
     * @param id
     */
    createEntity(id: EntityID): Entity {
        const entity = new Entity(id);
        this.entities.set(id, entity);
        return entity;
    }

    /**
     * @description 移除实体
     * @param id
     */
    removeEntity(id: EntityID) {
        this.entities.delete(id);
    }

    /**
     * @description 更新世界
     * @param deltaTime
     */
    update(deltaTime: number) {
        this.tickCount++;
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }

    /**
     * @description 获取快照
     */
    getSnapshot(): IWorldSnapshot {
        const plainEntities = Array.from(this.entities.values()).map(e => e.toJSON());
        return {
            tick: this.tickCount,
            entities: plainEntities,
            globalState: {},
        };
    }

    /**
     * @description 查询实体
     * @param filter
     */
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