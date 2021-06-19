/// <reference types="pino" />
import TypedEmitter from 'typed-emitter';
import { Logger } from '../../../utils/logger/logger';
import { ICandle, IProviderEvents } from '../../../interfaces';
import { IProviderCommon } from '../interfaces/IProviderCommon';
declare const ProviderCommon_base: new () => TypedEmitter<IProviderEvents>;
export declare class ProviderCommon extends ProviderCommon_base implements IProviderCommon {
    weightLimitPerMinute: number;
    name: string;
    log: Logger;
    constructor();
    weightLimitLevels: {
        type: string;
        ratio: number;
        waitTimeMS: number;
    }[];
    getVolatility(candles: ICandle[]): [low: number, high: number, variation: number];
    getApiRatioLimits(): Promise<any>;
    respectApiRatioLimits(): Promise<void>;
}
export {};
