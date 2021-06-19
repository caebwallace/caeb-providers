'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.OrderType = exports.OrderStatus = exports.ICandleChartIntervalInSeconds = exports.ICandleChartIntervalKeys = void 0;
var ICandleChartInterval_1 = require('./common/ICandleChartInterval');
Object.defineProperty(exports, 'ICandleChartIntervalKeys', {
    enumerable: true,
    get: function () {
        return ICandleChartInterval_1.ICandleChartIntervalKeys;
    },
});
Object.defineProperty(exports, 'ICandleChartIntervalInSeconds', {
    enumerable: true,
    get: function () {
        return ICandleChartInterval_1.ICandleChartIntervalInSeconds;
    },
});
var IOrder_1 = require('./common/IOrder');
Object.defineProperty(exports, 'OrderStatus', {
    enumerable: true,
    get: function () {
        return IOrder_1.OrderStatus;
    },
});
Object.defineProperty(exports, 'OrderType', {
    enumerable: true,
    get: function () {
        return IOrder_1.OrderType;
    },
});
