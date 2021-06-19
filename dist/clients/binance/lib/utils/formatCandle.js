'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatCandle = void 0;
const formatCandle = candle => {
    const intermediate = {
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
exports.formatCandle = formatCandle;
