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
     * A brief description of the entity.
     */
    type: 'room' | 'npc' | 'item' | 'player';
}

export interface IDescriptionComponent extends IComponent {
    _type: ComponentType.Description;
    short: string;
    long: string;
}

export interface LogEntry {
    id: string;
    text: string;
    type: 'info' | 'dialogue' | 'combat' | 'system';
    timestamp: number;
}

export interface INarrativeLogComponent extends IComponent {
    _type: ComponentType.NarrativeLog;
    history: LogEntry[];
}

export interface ChoiceAction {
    id: string;
    label: string;
    actionType: string;
    payload?: any;
}

export interface IChoiceListComponent extends IComponent {
    _type: ComponentType.ChoiceList;
    choices: ChoiceAction[];
}

export type GameComponent =
    | IBaseInfoComponent
    | IDescriptionComponent
    | INarrativeLogComponent
    | IChoiceListComponent
    | IComponent
