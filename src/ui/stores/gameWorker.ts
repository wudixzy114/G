import {defineStore} from "pinia";
import {ref, shallowRef} from "vue";
import {
    WorkerMessageType,
    MainMessageType,
    type IMainMessage,
    type IWorkerMessage
} from '@/shared/types/worker';
import type {IWorldSnapshot} from '@/shared/types/ecs';

/**
 * This store manages the communication with the game worker.
 */
export const useGameWorkerStore = defineStore('gameWorker', () => {
    /**
     * The game worker instance.
     */
    const worker = shallowRef<Worker | null>(null);
    /**
     * A flag indicating whether the game worker is ready.
     */
    const isReady = ref(false);
    /**
     * A flag indicating whether the game is currently running.
     */
    const isRunning = ref(false);

    /**
     * The latest snapshot of the game world received from the worker.
     */
    const latestSnapshot = ref<IWorldSnapshot | null>(null);
    /**
     * Initializes the game worker.
     */
    const initWorker = () => {
        if (worker.value) return;

        const newWorker = new Worker(new URL('@/core/worker.ts', import.meta.url), {
            type: 'module',
        });

        newWorker.onmessage = (event: MessageEvent<IMainMessage<any>>) => {
            const {type, payload} = event.data;

            switch (type) {
                case MainMessageType.READY:
                    isReady.value = true;
                    console.log('Main: Game Engine Ready.');
                    break;
                case MainMessageType.SNAPSHOT:
                    latestSnapshot.value = payload;
                    break;
                case MainMessageType.ERROR:
                    console.error('Worker error:', payload.message);
                    break;
                case MainMessageType.SAVED:
                    console.log('Main: Game World Saved.');
                    break;
            }
        };

        worker.value = newWorker;

        postMessage({
            type: WorkerMessageType.INIT,
            payload: undefined,
        });
    }

    /**
     * Posts a message to the game worker.
     * @param message The message to post.
     */
    const postMessage = <T extends WorkerMessageType>(message: IWorkerMessage<T>) => {
        if (!worker.value) {
            console.warn('Worker not initialized');
            return;
        }
        worker.value.postMessage(message);
    }

    /**
     * Starts the game.
     */
    const startGame = () => {
        postMessage({type: WorkerMessageType.START, payload: undefined});
        isRunning.value = true;
    };

    /**
     * Stops the game.
     */
    const stopGame = () => {
        postMessage({type: WorkerMessageType.STOP, payload: undefined});
        isRunning.value = false;
    };

    /**
     * Saves the game state.
     */
    const saveGame = () => {
        postMessage({type: WorkerMessageType.SAVE, payload: undefined});
    };

    return {
        /**
         * A flag indicating whether the game worker is ready.
         */
        isReady,
        /**
         * A flag indicating whether the game is currently running.
         */
        isRunning,
        /**
         * The latest snapshot of the game world received from the worker.
         */
        latestSnapshot,
        /**
         * Initializes the game worker.
         */
        initWorker,
        /**
         * Starts the game.
         */
        startGame,
        /**
         * Stops the game.
         */
        stopGame,
        /**
         * Saves the game state.
         */
        saveGame
    };
});