import {ComponentType, type IComponent} from "@/shared/types/ecs.ts";

/**
 * The base class for all components in the Entity-Component-System (ECS) architecture.
 * It provides a basic structure for components, including their type and data.
 *
 * @template T The type of data this component holds.
 */
export abstract class BaseComponent<T> implements IComponent {
    /**
     * The type of the component. This is an abstract property that must be implemented by subclasses.
     */
    abstract _type: ComponentType;

    /**
     * The data associated with this component.
     */
    data: T;

    /**
     * Creates an instance of a BaseComponent.
     * @param data The initial data for the component.
     * @protected
     */
    protected constructor(data: T) {
        this.data = data;
    }
}