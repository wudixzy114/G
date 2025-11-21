import {World} from './World.ts'

/**
 *系统基类
 */
export abstract class System {
    /**
     *世界
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
     *更新
     * @param deltaTime
     */
    abstract update(deltaTime: number): void;
}