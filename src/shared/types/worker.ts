// src/shared/types/worker.ts
import type {IWorldSnapshot} from './ecs';

// ----- Messages sent from the main thread to the worker -----

/**
 * Enumerates the types of messages that can be sent from the main thread to the worker.
 */
export enum WorkerMessageType {
    /**
     * Initializes the game world, including loading data from the database.
     */
    INIT = 'INIT',
    /**
     * Starts the game loop.
     */
    START = 'START',
    /**
     * Pauses the game loop.
     */
    STOP = 'STOP',
    /**
     * Manually triggers a save of the game state.
     */
    SAVE = 'SAVE',
    /**
     * Represents a player input command, such as moving, attacking, or interacting with objects.
     */
    PLAYER_INPUT = 'PLAYER_INPUT',
}

/**
 * Defines the payload for each type of worker message.
 */
export interface WorkerMessagePayloads {
    [WorkerMessageType.INIT]: undefined; // No payload required
    [WorkerMessageType.START]: undefined;
    [WorkerMessageType.STOP]: undefined;
    [WorkerMessageType.SAVE]: undefined;
    [WorkerMessageType.PLAYER_INPUT]: {
        /**
         * The specific action to be performed (e.g., 'move', 'attack').
         */
        action: string;
        /**
         * The data associated with the action, which varies depending on the action type.
         */
        payload: any; // The specific data for the command, to be refined later
    };
}

/**
 * Represents a message sent from the main thread to the worker.
 * @template T The type of the message.
 */
export interface IWorkerMessage<T extends WorkerMessageType> {
    type: T;
    payload: WorkerMessagePayloads[T];
}


// ----- Messages sent from the worker to the main thread -----

/**
 * Enumerates the types of messages that can be sent from the worker to the main thread.
 */
export enum MainMessageType {
    /**
     * Indicates that the world has finished loading.
     */
    READY = 'READY',
    /**
     * A snapshot of the world state for a single frame.
     */
    SNAPSHOT = 'SNAPSHOT',
    /**
     * A notification that the game state has been saved.
     */
    SAVED = 'SAVED',
    /**
     * A notification of an error that occurred in the worker.
     */
    ERROR = 'ERROR',
}

/**
 * Defines the payload for each type of main thread message.
 */
export interface MainMessagePayloads {
    /**
     * No payload is required for the READY message.
     */
    [MainMessageType.READY]: undefined;
    /**
     * The payload for the SNAPSHOT message, containing a snapshot of the game world.
     */
    [MainMessageType.SNAPSHOT]: IWorldSnapshot;
    /**
     * No payload is required for the SAVED message.
     */
    [MainMessageType.SAVED]: undefined;
    /**
     * The payload for the ERROR message, containing details about the error.
     */
    [MainMessageType.ERROR]: { message: string };
}

/**
 * Represents a message sent from the worker to the main thread.
 * @template T The type of the message.
 */
export interface IMainMessage<T extends MainMessageType> {
    type: T;
    payload: MainMessagePayloads[T];
}