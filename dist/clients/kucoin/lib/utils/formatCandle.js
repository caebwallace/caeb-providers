'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatCandle = void 0;
const formatCandle = (candle, intervalMs) => {
    const intermediate = {
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
exports.formatCandle = formatCandle;
