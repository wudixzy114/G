import { getDatabase } from './database';
import type { IEntity, EntityID } from '@/shared/types/ecs';
import type {DeepReadonly} from "rxdb";

/**
 * Provides a repository for managing entities in the database.
 */
export class EntityRepository {
    /**
     * Saves a single entity to the database.
     * @param entityData The entity data to save.
     */
    static async save(entityData: IEntity) {
        const db = await getDatabase();
        return db.entities.upsert(entityData);
    }

    /**
     * Saves a batch of entities to the database.
     * @param entitiesData An array of entity data to save.
     */
    static async saveBatch(entitiesData: IEntity[]) {
        const db = await getDatabase();
        return db.entities.bulkUpsert(entitiesData);
    }

    /**
     * Loads all entities from the database.
     * This is typically used when the game starts.
     * @returns A promise that resolves with an array of all entities.
     */
    static async loadAll(): Promise<DeepReadonly<IEntity[]>> {
        const db = await getDatabase();
        const docs = await db.entities.find().exec();
        return docs.map(doc => doc.toJSON());
    }

    /**
     * Loads a single entity from the database by its ID.
     * @param id The ID of the entity to load.
     * @returns A promise that resolves with the entity data, or null if not found.
     */
    static async loadById(id: EntityID): Promise<DeepReadonly<IEntity> | null> {
        const db = await getDatabase();
        const doc = await db.entities.findOne(id).exec();
        return doc ? doc.toJSON() : null;
    }

    /**
     * Clears all entities from the database.
     * This is useful for debugging purposes.
     */
    static async clearAll() {
        const db = await getDatabase();
        await db.entities.remove();
    }
}