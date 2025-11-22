import { createRxDatabase, type RxDatabase, type RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { EntitySchema } from './schema/entity.schema';
import type { IEntity } from '@/shared/types/ecs';

/**
 * Defines the collections that are available in the game database.
 */
export type GameDatabaseCollections = {
    /**
     * The collection of all entities in the game.
     */
    entities: RxCollection<IEntity>;
}

/**
 * Represents the game database, which is an RxDB instance.
 */
export type GameDatabase = RxDatabase<GameDatabaseCollections>;

let dbPromise: Promise<GameDatabase> | null = null;

/**
 * Creates and initializes the game database.
 * @returns A promise that resolves with the database instance.
 * @private
 */
const _createDatabase = async (): Promise<GameDatabase> => {
    console.log('Database: Initializing...');

    const db = await createRxDatabase<GameDatabaseCollections>({
        name: 'openworld_rpg_db',
        storage: getRxStorageDexie(),
        ignoreDuplicate: true, // Prevents errors during hot-reloading in development mode
    });

    await db.addCollections({
        entities: {
            schema: EntitySchema,
        },
    });

    console.log('Database: Ready.');
    return db;
};

/**
 * Returns a promise that resolves with the game database instance.
 * If the database has not been created yet, it will be created and initialized.
 * @returns A promise that resolves with the database instance.
 */
export const getDatabase = (): Promise<GameDatabase> => {
    if (!dbPromise) {
        dbPromise = _createDatabase();
    }
    return dbPromise;
};