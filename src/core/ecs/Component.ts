import {ComponentType, type IComponent} from "@/shared/types/ecs.ts";

/**
 *组件基类
 * @template T
 */
export abstract class BaseComponent<T> implements IComponent {
    /**
     *组件类型
     */
    abstract _type: ComponentType;
    /**
     *组件数据
     */
    data: T;

    /**
     * @param data
     * @protected
     */
    protected constructor(data: T) {
        this.data = data;
    }
}