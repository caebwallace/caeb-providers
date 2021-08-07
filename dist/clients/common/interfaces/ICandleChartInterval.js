'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ICandleChartIntervalInSeconds = exports.ICandleChartIntervalKeys = void 0;
var ICandleChartIntervalKeys;
(function (ICandleChartIntervalKeys) {
    ICandleChartIntervalKeys['ONE_MINUTE'] = 'ONE_MINUTE';
    ICandleChartIntervalKeys['FIVE_MINUTES'] = 'FIVE_MINUTES';
    ICandleChartIntervalKeys['FIFTEEN_MINUTES'] = 'FIFTEEN_MINUTES';
    ICandleChartIntervalKeys['ONE_HOUR'] = 'ONE_HOUR';
    ICandleChartIntervalKeys['FOUR_HOURS'] = 'FOUR_HOURS';
    ICandleChartIntervalKeys['ONE_DAY'] = 'ONE_DAY';
})((ICandleChartIntervalKeys = exports.ICandleChartIntervalKeys || (exports.ICandleChartIntervalKeys = {})));
var ICandleChartIntervalInSeconds;
(function (ICandleChartIntervalInSeconds) {
    ICandleChartIntervalInSeconds[(ICandleChartIntervalInSeconds['ONE_MINUTE'] = 60)] = 'ONE_MINUTE';
    ICandleChartIntervalInSeconds[(ICandleChartIntervalInSeconds['FIVE_MINUTES'] = 300)] = 'FIVE_MINUTES';
    ICandleChartIntervalInSeconds[(ICandleChartIntervalInSeconds['FIFTEEN_MINUTES'] = 900)] = 'FIFTEEN_MINUTES';
    ICandleChartIntervalInSeconds[(ICandleChartIntervalInSeconds['ONE_HOUR'] = 3600)] = 'ONE_HOUR';
    ICandleChartIntervalInSeconds[(ICandleChartIntervalInSeconds['FOUR_HOURS'] = 14400)] = 'FOUR_HOURS';
    ICandleChartIntervalInSeconds[(ICandleChartIntervalInSeconds['ONE_DAY'] = 86400)] = 'ONE_DAY';
})((ICandleChartIntervalInSeconds = exports.ICandleChartIntervalInSeconds || (exports.ICandleChartIntervalInSeconds = {})));
