import {Entity} from './Entity';
import {System} from './System';
import type {EntityID, IWorldSnapshot} from '@/shared/types/ecs';
import {EntityRepository} from "@/core/db/repository.ts";

/**
 *世界
 */
export class World {
    /**
     *实体列表
     */
    entities: Map<EntityID, Entity> = new Map();
    /**
     *系统列表
     */
    systems: System[] = [];
    /**
     *游戏刻
     */
    tickCount: number = 0;

    // 标记世界是否已准备好 (数据加载完毕)
    isReady: boolean = false;

    constructor() {
    }

    /**
     *添加系统
     * @param systemClass
     */
    addSystem(systemClass: new (world: World) => System) {
        const system = new systemClass(this);
        this.systems.push(system);
    }

    /**
     *创建实体
     * @param id
     */
    createEntity(id: EntityID): Entity {
        const entity = new Entity(id);
        this.entities.set(id, entity);
        return entity;
    }

    /**
     *移除实体
     * @param id
     */
    removeEntity(id: EntityID) {
        this.entities.delete(id);
    }

    /**
     *更新世界
     * @param deltaTime
     */
    update(deltaTime: number) {
        this.tickCount++;
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }

    /**
     *获取快照
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
     *查询实体
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

    // 核心：从数据库初始化世界
    async init() {
        console.log('World: Loading entities from DB...');
        const storedEntities = await EntityRepository.loadAll();

        if (storedEntities.length === 0) {
            console.log('World: New Game created.');
            // TODO: 这里可以调用一个种子函数来生成初始世界
        } else {
            console.log(`World: Restored ${storedEntities.length} entities.`);
            for (const data of storedEntities) {
                const entity = new Entity(data.id).fromJSON(data);
                this.entities.set(entity.id, entity);
            }
        }

        this.isReady = true;
    }

    // 核心：保存世界状态到数据库
    async save() {
        if (!this.isReady) return;

        console.log('World: Saving...');
        const allData = Array.from(this.entities.values()).map(e => e.toJSON());
        await EntityRepository.saveBatch(allData);
        console.log('World: Saved.');
    }
}