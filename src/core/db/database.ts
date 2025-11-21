import { createRxDatabase, type RxDatabase, type RxCollection } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { EntitySchema } from './schema/entity.schema';
import type { IEntity } from '@/shared/types/ecs';

export type GameDatabaseCollections = {
    entities: RxCollection<IEntity>;
}

export type GameDatabase = RxDatabase<GameDatabaseCollections>;

let dbPromise: Promise<GameDatabase> | null = null;
const _createDatabase = async (): Promise<GameDatabase> => {
    console.log('Database: Initializing...');

    const db = await createRxDatabase<GameDatabaseCollections>({
        name: 'openworld_rpg_db',
        storage: getRxStorageDexie(),
        ignoreDuplicate: true, // 开发模式下防止热重载报错
    });

    await db.addCollections({
        entities: {
            schema: EntitySchema,
        },
    });

    console.log('Database: Ready.');
    return db;
};

export const getDatabase = (): Promise<GameDatabase> => {
    if (!dbPromise) {
        dbPromise = _createDatabase();
    }
    return dbPromise;
};