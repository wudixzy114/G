import {World} from './World.ts'

/**
 * The base class for all systems in the ECS architecture.
 * Systems are responsible for updating the state of entities and their components.
 */
export abstract class System {
    /**
     * The world instance that this system belongs to.
     * @protected
     */
    protected world: World;

    /**
     * Creates a new System instance.
     * @param world The world instance that this system will operate on.
     * @protected
     */
    protected constructor(world: World) {
        this.world = world;
    }

    /**
     * This method is called on every tick of the game loop and should contain the system's logic.
     * @param deltaTime The time elapsed since the last update, in seconds.
     */
    abstract update(deltaTime: number): void;
}