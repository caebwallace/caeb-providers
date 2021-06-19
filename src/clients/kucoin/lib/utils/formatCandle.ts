import { ICandle } from '../../../../interfaces/';

// [
//     "1545904980",             //Start time of the candle cycle
//     "0.058",                  //opening price
//     "0.049",                  //closing price
//     "0.058",                  //highest price
//     "0.049",                  //lowest price
//     "0.018",                  //Transaction amount
//     "0.000945"                //Transaction volume
// ],
export interface KucoinKline {
    [key: number]: string;
}

/**
 * Format bastract candle.
 *
 * @private
 * @param {Array} candle - The candle to format.
 * @param {number} intervalMs - The interval in MS
 * @returns {ICandle} - The formated candle.
 * @memberof ProviderBinance
 */
export const formatCandle = (candle: KucoinKline, intervalMs: number): ICandle => {
    const intermediate: any = {
        openTime: new Date(parseFloat(candle[0]) * 1000),
        closeTime: new Date(parseFloat(candle[0]) * 1000 + intervalMs),
        open: parseFloat(candle[1]),
        close: parseFloat(candle[2]),
        high: parseFloat(candle[3]),
        low: parseFloat(candle[4]),
        volume: parseFloat(candle[5]),
        quoteVolume: parseFloat(candle[6]),
    };
    return intermediate;
};
