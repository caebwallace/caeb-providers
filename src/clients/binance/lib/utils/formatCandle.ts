import { CandleChartResult } from 'binance-api-node';
import { ICandle } from '../../../common/interfaces';

/**
 * Format bastract candle.
 *
 * @private
 * @param {CandleChartResult} candle - The candle to format.
 * @returns {ICandle} - The formated candle.
 * @memberof ProviderBinance
 */
export const formatCandle = (candle: CandleChartResult): ICandle => {
    const intermediate: any = {
        openTime: new Date(candle.openTime),
        closeTime: new Date(candle.closeTime),
        open: parseFloat(candle.open),
        high: parseFloat(candle.high),
        low: parseFloat(candle.low),
        close: parseFloat(candle.close),
        volume: parseFloat(candle.volume),
        quoteVolume: parseFloat(candle.quoteVolume),
        trades: candle.trades,
        baseAssetVolume: parseFloat(candle.baseAssetVolume),
        quoteAssetVolume: parseFloat(candle.quoteAssetVolume),
    };
    return intermediate;
};
