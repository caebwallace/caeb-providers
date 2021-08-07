import { ICandle } from '../../../common/interfaces';
export interface KucoinKline {
    [key: number]: string;
}
export declare const formatCandle: (candle: KucoinKline, intervalMs: number) => ICandle;
