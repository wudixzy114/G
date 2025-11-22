// src/shared/types/worker.ts
import type {IWorldSnapshot} from './ecs';

// ----- 主线程发送给 Worker 的消息 -----

export enum WorkerMessageType {
    INIT = 'INIT',         // 初始化世界 (加载 DB)
    START = 'START',       // 开始游戏循环
    STOP = 'STOP',         // 暂停游戏循环
    SAVE = 'SAVE',         // 手动触发保存
    PLAYER_INPUT = 'PLAYER_INPUT', // 玩家操作指令 (如移动、攻击、对话)
}

export interface WorkerMessagePayloads {
    [WorkerMessageType.INIT]: undefined; // 不需要负载
    [WorkerMessageType.START]: undefined;
    [WorkerMessageType.STOP]: undefined;
    [WorkerMessageType.SAVE]: undefined;
    [WorkerMessageType.PLAYER_INPUT]: {
        action: string;
        payload: any; // 具体的指令数据，后续细化
    };
}

export interface IWorkerMessage<T extends WorkerMessageType> {
    type: T;
    payload: WorkerMessagePayloads[T];
}


// ----- Worker 发送给 主线程 的消息 -----

export enum MainMessageType {
    READY = 'READY',             // 世界加载完成
    SNAPSHOT = 'SNAPSHOT',       // 每一帧的世界快照
    SAVED = 'SAVED',             // 保存完成通知
    ERROR = 'ERROR',             // 错误通知
}

export interface MainMessagePayloads {
    [MainMessageType.READY]: undefined;
    [MainMessageType.SNAPSHOT]: IWorldSnapshot;
    [MainMessageType.SAVED]: undefined;
    [MainMessageType.ERROR]: { message: string };
}

export interface IMainMessage<T extends MainMessageType> {
    type: T;
    payload: MainMessagePayloads[T];
}