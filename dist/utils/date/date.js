'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ceilCandleDate = exports.floorCandleDate = void 0;
function floorCandleDate(date, windowInterval) {
    return date - (date % windowInterval) + 1;
}
exports.floorCandleDate = floorCandleDate;
function ceilCandleDate(date, windowInterval) {
    return date + (windowInterval - (date % windowInterval));
}
exports.ceilCandleDate = ceilCandleDate;
