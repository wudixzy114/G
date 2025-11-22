import {World} from "@/core/ecs/World.ts";
import {
    WorkerMessageType,
    MainMessageType,
    type IWorkerMessage,
    type MainMessagePayloads
} from "@/shared/types/worker.ts";
import {ComponentType} from "@/shared/types/ecs.ts";

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

                if (world.entities.size === 0) {
                    console.log("Worker: Creating Initial World State...");

                    // 1. 创建玩家
                    const player = world.createEntity('player_main');
                    player.addTag('Player');
                    player.addComponent({
                        _type: ComponentType.BaseInfo,
                        name: '冒险者',
                        type: 'player'
                    });
                    player.addComponent({
                        _type: ComponentType.NarrativeLog,
                        history: [
                            {id: '1', text: '你醒来了，头很痛。周围一片漆黑。', type: 'info', timestamp: Date.now()}
                        ]
                    });
                    player.addComponent({
                        _type: ComponentType.ChoiceList,
                        choices: [
                            {id: 'look', label: '观察四周', actionType: 'LOOK'},
                            {id: 'inv', label: '检查背包', actionType: 'OPEN_INVENTORY'}
                        ]
                    });

                    // 2. 创建一个房间
                    const room = world.createEntity('room_start');
                    room.addTag('CurrentRoom'); // 标记这是当前房间
                    room.addComponent({
                        _type: ComponentType.BaseInfo,
                        name: '黑暗的石室',
                        type: 'room'
                    });
                    room.addComponent({
                        _type: ComponentType.Description,
                        short: '一个潮湿的石室。',
                        long: '墙壁上挂着早已熄灭的火把，空气中弥漫着陈旧的霉味。地上似乎有什么东西闪闪发光。'
                    });
                }

                postToMain(MainMessageType.READY, undefined);
            } catch (err) {
                console.error('❌ Worker Init Error Details:', err);
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
