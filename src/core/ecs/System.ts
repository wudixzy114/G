import {World} from './World.ts'

/**
 * @description 系统基类
 */
export abstract class System {
    /**
     * @description 世界
     * @protected
     */
    protected world: World;

    /**
     * @param world
     * @protected
     */
    protected constructor(world: World) {
        this.world = world;
    }

    /**
     * @description 更新
     * @param deltaTime
     */
    abstract update(deltaTime: number): void;
}