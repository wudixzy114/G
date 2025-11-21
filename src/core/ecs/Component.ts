import {ComponentType, type IComponent} from "@/shared/types/ecs.ts";

export abstract class BaseComponent<T> implements IComponent {
    abstract _type: ComponentType;
    data: T;

    protected constructor(data: T) {
        this.data = data;
    }
}
