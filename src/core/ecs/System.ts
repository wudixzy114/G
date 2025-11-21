import {World} from './World.ts'

export abstract class System {
    protected world: World;

    protected constructor(world: World) {
        this.world = world;
    }

    abstract update(deltaTime: number): void;
}
