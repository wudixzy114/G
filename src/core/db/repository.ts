import { getDatabase } from './database';
import type { IEntity, EntityID } from '@/shared/types/ecs';
import type {DeepReadonly} from "rxdb";

export class EntityRepository {
    // 保存单个实体
    static async save(entityData: IEntity) {
        const db = await getDatabase();
        return db.entities.upsert(entityData);
    }

    // 批量保存实体
    static async saveBatch(entitiesData: IEntity[]) {
        const db = await getDatabase();
        return db.entities.bulkUpsert(entitiesData);
    }

    // 加载所有实体 (游戏启动时)
    static async loadAll(): Promise<DeepReadonly<IEntity[]>> {
        const db = await getDatabase();
        const docs = await db.entities.find().exec();
        return docs.map(doc => doc.toJSON());
    }

    // 根据 ID 加载
    static async loadById(id: EntityID): Promise<DeepReadonly<IEntity> | null> {
        const db = await getDatabase();
        const doc = await db.entities.findOne(id).exec();
        return doc ? doc.toJSON() : null;
    }

    // 清空存档 (调试用)
    static async clearAll() {
        const db = await getDatabase();
        await db.entities.remove();
    }
}
