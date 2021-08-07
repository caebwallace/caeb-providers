'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatCandle = void 0;
const formatCandle = (candle, intervalMs) => {
    const intermediate = {
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
exports.formatCandle = formatCandle;
