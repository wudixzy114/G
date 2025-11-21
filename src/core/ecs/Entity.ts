import type {ComponentType, EntityID, IComponent, IEntity} from "@/shared/types/ecs.ts";

/**
 *实体类
 */
export class Entity {
    /**
     *实体ID
     */
    id: EntityID;
    /**
     *组件列表
     */
    components: Partial<Record<ComponentType, IComponent>> = {};
    /**
     *标签列表
     */
    tags: Set<string> = new Set();

    /**
     * @param id
     */
    constructor(id: EntityID) {
        this.id = id;
    }

    /**
     *添加组件
     * @param component
     */
    addComponent(component: IComponent) {
        this.components[component._type] = component;
        return this;
    }

    /**
     *获取组件
     * @param type
     */
    getComponent<T extends IComponent>(type: ComponentType): T | undefined {
        return this.components[type] as T;
    }

    /**
     *是否有组件
     * @param type
     */
    hasComponent(type: ComponentType): boolean {
        return !!this.components[type];
    }

    /**
     *添加标签
     * @param tag
     */
    addTag(tag: string) {
        this.tags.add(tag);
        return this;
    }

    /**
     *序列化
     */
    toJSON(): IEntity {
        return {
            id: this.id,
            components: this.components,
            tags: Array.from(this.tags),
        };
    }

    /**
     *反序列化
     * @param json
     */
    fromJSON(json: IEntity) {
        this.id = json.id;
        this.components = {...json.components};
        this.tags = new Set(json.tags);
        return this;
    }
}