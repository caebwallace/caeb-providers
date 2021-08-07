import { ICandle } from '../../../common/interfaces';
export interface FtxKline {
    time: number;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}
export declare const formatCandle: (candle: FtxKline, intervalMs: number) => ICandle;
