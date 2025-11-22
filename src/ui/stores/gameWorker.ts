import {defineStore} from "pinia";
import {ref, shallowRef} from "vue";
import {
    WorkerMessageType,
    MainMessageType,
    type IMainMessage,
    type IWorkerMessage
} from '@/shared/types/worker';
import type {IWorldSnapshot} from '@/shared/types/ecs';

export const useGameWorkerStore = defineStore('gameWorker', () => {
    const worker = shallowRef<Worker | null>(null);
    const isReady = ref(false);
    const isRunning = ref(false);

    const latestSnapshot = ref<IWorldSnapshot | null>(null);
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

    const postMessage = <T extends WorkerMessageType>(message: IWorkerMessage<T>) => {
        if (!worker.value) {
            console.warn('Worker not initialized');
            return;
        }
        worker.value.postMessage(message);
    }

    // 动作 API
    const startGame = () => {
        postMessage({type: WorkerMessageType.START, payload: undefined});
        isRunning.value = true;
    };

    const stopGame = () => {
        postMessage({type: WorkerMessageType.STOP, payload: undefined});
        isRunning.value = false;
    };

    const saveGame = () => {
        postMessage({type: WorkerMessageType.SAVE, payload: undefined});
    };

    return {
        isReady,
        isRunning,
        latestSnapshot,
        initWorker,
        startGame,
        stopGame,
        saveGame
    };
});
