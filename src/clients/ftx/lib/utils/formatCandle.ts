import { ICandle } from '../../../common/interfaces';

export interface FtxKline {
    time: number;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
}

/**
 * Format bastract candle.
 *
 * @private
 * @param {Array} candle - The candle to format.
 * @param {number} intervalMs - The interval in MS
 * @returns {ICandle} - The formated candle.
 */
export const formatCandle = (candle: FtxKline, intervalMs: number): ICandle => {
    const intermediate: any = {
        openTime: new Date(candle.time),
        closeTime: new Date(candle.time + intervalMs),
        open: candle.open,
        close: candle.close,
        high: candle.high,
        low: candle.low,
        volume: candle.volume,
    };
    return intermediate;
};
