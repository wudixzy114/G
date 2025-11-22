import {Entity} from './Entity';
import {System} from './System';
import type {EntityID, IWorldSnapshot} from '@/shared/types/ecs';
import {EntityRepository} from "@/core/db/repository.ts";
import {type WorkerMessagePayloads, WorkerMessageType} from "@/shared/types/worker.ts";

/**
 * The World class is the container for all entities, components, and systems.
 * It manages the game state and the ECS lifecycle.
 */
export class World {
    /**
     * A map of all entities in the world, with the entity ID as the key.
     */
    entities: Map<EntityID, Entity> = new Map();
    /**
     * An array of all systems in the world.
     */
    systems: System[] = [];
    /**
     * The current tick count of the game loop.
     */
    tickCount: number = 0;

    /**
     * A flag indicating whether the world has been initialized with data.
     */
    isReady: boolean = false;

    /**
     * A queue for player inputs.
     * @internal
     */
    inputQueue: WorkerMessagePayloads[WorkerMessageType.PLAYER_INPUT][] = [];

    /**
     * Creates a new World instance.
     */
    constructor() {
    }

    /**
     * Adds a new system to the world.
     * @param systemClass The class of the system to add.
     */
    addSystem(systemClass: new (world: World) => System) {
        const system = new systemClass(this);
        this.systems.push(system);
    }

    /**
     * Creates a new entity in the world.
     * @param id The ID of the entity to create.
     * @returns The newly created entity.
     */
    createEntity(id: EntityID): Entity {
        const entity = new Entity(id);
        this.entities.set(id, entity);
        return entity;
    }

    /**
     * Removes an entity from the world.
     * @param id The ID of the entity to remove.
     */
    removeEntity(id: EntityID) {
        this.entities.delete(id);
    }

    /**
     * Updates the world by executing all systems.
     * @param deltaTime The time elapsed since the last update, in seconds.
     */
    update(deltaTime: number) {
        this.tickCount++;
        for (const system of this.systems) {
            system.update(deltaTime);
        }
    }

    /**
     * Creates a snapshot of the current state of the world.
     * @returns A snapshot of the world.
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
     * Queries for entities that match a given filter.
     * @param filter A function that returns true if an entity should be included in the result.
     * @returns An array of entities that match the filter.
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

    /**
     * Pushes a player input to the queue.
     * @param input The player input to push.
     */
    pushInput(input: WorkerMessagePayloads[WorkerMessageType.PLAYER_INPUT]) {
        this.inputQueue.push(input);
    }

    /**
     * Consumes all player inputs from the queue.
     * @returns An array of player inputs.
     */
    consumeInputs(): WorkerMessagePayloads[WorkerMessageType.PLAYER_INPUT][] {
        const inputs = [...this.inputQueue];
        this.inputQueue = [];
        return inputs;
    }

    /**
     * Initializes the world by loading entities from the database.
     */
    async init() {
        console.log('World: Loading entities from DB...');
        const storedEntities = await EntityRepository.loadAll();

        if (storedEntities.length === 0) {
            console.log('World: New Game created.');
            // TODO: This is where a seeding function can be called to generate the initial world
        } else {
            console.log(`World: Restored ${storedEntities.length} entities.`);
            for (const data of storedEntities) {
                const entity = new Entity(data.id).fromJSON(data);
                this.entities.set(entity.id, entity);
            }
        }

        this.isReady = true;
    }

    /**
     * Saves the current state of the world to the database.
     */
    async save() {
        if (!this.isReady) return;

        console.log('World: Saving...');
        const allData = Array.from(this.entities.values()).map(e => e.toJSON());
        await EntityRepository.saveBatch(allData);
        console.log('World: Saved.');
    }
}