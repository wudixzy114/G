// src/shared/types/ecs.ts

/**
 * Represents the unique identifier for an entity.
 */
export type EntityID = string;

/**
 * Enumerates the available component types in the Entity-Component-System (ECS).
 */
export enum ComponentType {
    /**
     * Basic information about an entity, such as name and description.
     */
    BaseInfo = 'BaseInfo',
    /**
     * The position of an entity in the game world.
     */
    Position = 'Position',
    /**
     * The inventory of an entity, containing items.
     */
    ChoiceList = 'ChoiceList',
    /**
     * The stats of an entity, such as health, mana, etc.
     */
    Stats = 'Stats',
    /**
     * The narrative state of an entity.
     */
    NarrativeLog = 'NarrativeLog',
    /**
     * The description of an entity.
     */
    Description = 'Description',
}

/**
 * The base interface for all components.
 */
export interface IComponent {
    /**
     * The type of the component.
     */
    _type: ComponentType;
}

/**
 * Represents an entity in the game world.
 * An entity is a general-purpose object. In an ECS architecture, entities are "things" that exist in the game world.
 * Each entity is unique and is composed of one or more components.
 */
export interface IEntity {
    /**
     * The unique identifier of the entity.
     */
    id: EntityID;
    /**
     * A dictionary of components attached to this entity.
     * The keys are the component types, and the values are the component instances.
     */
    components: {
        [key in ComponentType]?: IComponent
    };
    /**
     * A list of tags associated with the entity.
     * Tags can be used to identify or group entities.
     */
    tags: string[];
}

/**
 * Represents a snapshot of the entire game world at a specific moment in time.
 */
export interface IWorldSnapshot {
    /**
     * The simulation tick at which the snapshot was taken.
     */
    tick: number;
    /**
     * A list of all entities present in the world at the time of the snapshot.
     */
    entities: IEntity[];
    /**
     * A record of the global state of the world.
     * This can be used to store any data that is not attached to a specific entity.
     */
    globalState: Record<string, any>;
}

export interface IBaseInfoComponent extends IComponent {
    _type: ComponentType.BaseInfo;
    /**
     * The name of the entity.
     */
    name: string;
    /**
     * The type of the entity, e.g., 'room', 'npc', 'item', or 'player'.
     */
    type: 'room' | 'npc' | 'item' | 'player';
}

/**
 * Represents a component that provides a short and long description for an entity.
 */
export interface IDescriptionComponent extends IComponent {
    _type: ComponentType.Description;
    /**
     * A short description of the entity.
     */
    short: string;
    /**
     * A long, more detailed description of the entity.
     */
    long: string;
}

/**
 * Represents a single entry in the narrative log.
 */
export interface LogEntry {
    /**
     * The unique identifier for the log entry.
     */
    id: string;
    /**
     * The text content of the log entry.
     */
    text: string;
    /**
     * The type of the log entry, e.g., 'info', 'dialogue', 'combat', or 'system'.
     */
    type: 'info' | 'dialogue' | 'combat' | 'system';
    /**
     * The timestamp when the log entry was created.
     */
    timestamp: number;
}

/**
 * Represents a component that stores a history of narrative log entries for an entity.
 */
export interface INarrativeLogComponent extends IComponent {
    _type: ComponentType.NarrativeLog;
    /**
     * An array of log entries, forming the narrative history.
     */
    history: LogEntry[];
}

/**
 * Represents a single choice action available to the player.
 */
export interface ChoiceAction {
    /**
     * The unique identifier for the choice action.
     */
    id: string;
    /**
     * The label displayed for the choice.
     */
    label: string;
    /**
     * The type of action this choice triggers.
     */
    actionType: string;
    /**
     * Optional payload data associated with the action.
     */
    payload?: any;
}

/**
 * Represents a component that holds a list of choices available to an entity.
 */
export interface IChoiceListComponent extends IComponent {
    _type: ComponentType.ChoiceList;
    /**
     * An array of available choice actions.
     */
    choices: ChoiceAction[];
}

/**
 * Represents a component that defines the 2D position of an entity in the game world.
 */
export interface IPositionComponent extends IComponent {
    _type: ComponentType.Position;
    /**
     * The x-coordinate of the entity's position.
     */
    x: number;
    /**
     * The y-coordinate of the entity's position.
     */
    y: number;
}

/**
 * A union type representing all possible game components.
 */
export type GameComponent =
    | IBaseInfoComponent
    | IDescriptionComponent
    | INarrativeLogComponent
    | IChoiceListComponent
    | IComponent