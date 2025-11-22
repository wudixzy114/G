import type {ComponentType, EntityID, IComponent, IEntity} from "@/shared/types/ecs.ts";
import type {DeepReadonly} from "rxdb";

/**
 * Represents an entity in the ECS architecture.
 * An entity is a container for components and is identified by a unique ID.
 */
export class Entity {
    /**
     * The unique identifier for the entity.
     */
    id: EntityID;

    /**
     * A map of components attached to the entity, indexed by their type.
     */
    components: Partial<Record<ComponentType, IComponent>> = {};

    /**
     * A set of tags associated with the entity for grouping or identification.
     */
    tags: Set<string> = new Set();

    /**
     * Creates a new Entity instance.
     * @param id The unique identifier for the entity.
     */
    constructor(id: EntityID) {
        this.id = id;
    }

    /**
     * Adds a component to the entity.
     * @param component The component to add.
     * @returns The entity instance for chaining.
     */
    addComponent(component: IComponent): this {
        this.components[component._type] = component;
        return this;
    }

    /**
     * Retrieves a component from the entity by its type.
     * @param type The type of the component to retrieve.
     * @returns The component instance, or undefined if not found.
     * @template T The type of the component to retrieve.
     */
    getComponent<T extends IComponent>(type: ComponentType): T | undefined {
        return this.components[type] as T;
    }

    /**
     * Checks if the entity has a component of a given type.
     * @param type The type of the component to check for.
     * @returns True if the component exists, false otherwise.
     */
    hasComponent(type: ComponentType): boolean {
        return !!this.components[type];
    }

    /**
     * Adds a tag to the entity.
     * @param tag The tag to add.
     * @returns The entity instance for chaining.
     */
    addTag(tag: string): this {
        this.tags.add(tag);
        return this;
    }

    /**
     * Serializes the entity to a plain JSON object.
     * @returns An IEntity object representing the entity's state.
     */
    toJSON(): IEntity {
        return {
            id: this.id,
            components: this.components,
            tags: Array.from(this.tags),
        };
    }

    /**
     * Deserializes the entity from a plain JSON object.
     * @param json The IEntity object to deserialize from.
     * @returns The entity instance for chaining.
     */
    fromJSON(json: DeepReadonly<IEntity>): this {
        this.id = json.id;
        if (json.components) {
            this.components = structuredClone(json.components);
        } else {
            this.components = {};
        }
        this.tags = new Set(json.tags);
        return this;
    }
}