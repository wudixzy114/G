import {World} from "@/core/ecs/World.ts";
import {
    WorkerMessageType,
    MainMessageType,
    type IWorkerMessage,
    type MainMessagePayloads
} from "@/shared/types/worker.ts";

const world = new World();

const TICK_RATE = 30;
const MS_PER_TICK = 1000 / TICK_RATE;

let lastTime = performance.now();
let timerId: ReturnType<typeof setInterval> | null = null;

function postToMain<T extends MainMessageType>(type: T, payload: MainMessagePayloads[T]) {
    self.postMessage({type, payload});
}

function gameLoop() {
    const currentTime = performance.now();
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    try {
        world.update(deltaTime);

        const snapshot = world.getSnapshot();
        postToMain(MainMessageType.SNAPSHOT, snapshot);
    } catch (error) {
        console.error('Game Loop Error:', error);
        stopLoop();
        postToMain(MainMessageType.ERROR, {message: (error as Error).message});
    }
}

function startLoop() {
    if (timerId) return;
    console.log('Worker: Starting Game Loop...');
    lastTime = performance.now();
    timerId = setInterval(gameLoop, MS_PER_TICK);
}

function stopLoop() {
    if (timerId) {
        console.log('Worker: Stopping Game Loop...');
        clearInterval(timerId);
        timerId = null;
    }
}

self.onmessage = async (event: MessageEvent<IWorkerMessage<any>>) => {
    const {type, payload} = event.data;

    switch (type) {
        case WorkerMessageType.INIT:
            try {
                await world.init();
                postToMain(MainMessageType.READY, undefined);
            } catch (err) {
                postToMain(MainMessageType.ERROR, {message: 'DB Init Failed'});
            }
            break;

        case WorkerMessageType.START:
            startLoop();
            break;

        case WorkerMessageType.STOP:
            stopLoop();
            break;

        case WorkerMessageType.SAVE:
            await world.save();
            postToMain(MainMessageType.SAVED, undefined);
            break;

        case WorkerMessageType.PLAYER_INPUT:
            // 简单的调试逻辑：如果是 DEBUG_CREATE，则创建一个实体
            if (payload.action === 'DEBUG_CREATE') {
                const id = `test_entity_${Date.now()}`;
                console.log('Worker: Creating debug entity', id);

                const entity = world.createEntity(id);
                entity.addTag('Player');
                // 这里可以添加更多组件...
            }
            // TODO: 将输入转化为 ECS 中的 Component 或 Event
            console.log('Worker received input:', payload);
            // 示例: world.addInputEvent(payload);
            break;

        default:
            console.warn(`Worker received unknown message: ${type}`);
    }
}

export {};
