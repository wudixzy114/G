import type {EntityID, ComponentType, IComponent, IEntity} from "@/shared/types/ecs.ts";

export class Entity {
    id: EntityID;
    components: Partial<Record<ComponentType, IComponent>> = {};
    tags: Set<string> = new Set();

    constructor(id: EntityID) {
        this.id = id;
    }

    addComponent(component: IComponent) {
        this.components[component._type] = component;
        return this;
    }

    getComponent<T extends IComponent>(type: ComponentType): T | undefined {
        return this.components[type] as T;
    }

    hasComponent(type: ComponentType): boolean {
        return !!this.components[type];
    }

    addTag(tag: string) {
        this.tags.add(tag);
        return this;
    }

    toJSON(): IEntity {
        return {
            id: this.id,
            components: this.components,
            tags: Array.from(this.tags),
        };
    }

    fromJSON(json: IEntity) {
        this.id = json.id;
        this.components = json.components;
        this.tags = new Set(json.tags);
        return this;
    }
}

