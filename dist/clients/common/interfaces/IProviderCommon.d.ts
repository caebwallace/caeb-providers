import { ICandle } from '../../../interfaces/common/ICandle';
export interface IProviderCommon {
    weightLimitPerMinute: number;
    weightLimitLevels: {
        type: string;
        ratio: number;
        waitTimeMS: number;
    }[];
    getVolatility(candles: ICandle[]): [low: number, high: number, variation: number];
    getApiRatioLimits(): Promise<any>;
    respectApiRatioLimits(): Promise<void>;
}
