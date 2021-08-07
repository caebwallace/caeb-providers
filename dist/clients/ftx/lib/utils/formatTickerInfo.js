'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatTickerInfo = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatTickerInfo = asset => {
    return {
        baseAsset: asset.baseCurrency,
        quoteAsset: asset.quoteCurrency,
        status: asset.enabled ? 'TRADING' : 'LISTING',
        pricePrecision: numbers_1.nz(numbers_1.countDecimals(parseFloat(asset.priceIncrement)), 8) || 8,
        quotePrecision: numbers_1.nz(numbers_1.countDecimals(parseFloat(asset.quoteIncrement)), 8) || 8,
        minPrice: numbers_1.nz(parseFloat(asset.baseMinSize), 0),
        maxPrice: numbers_1.nz(parseFloat(asset.baseMaxSize), 0),
        minQty: numbers_1.nz(parseFloat(asset.minProvideSize), 0),
        stepSize: numbers_1.nz(parseFloat(asset.priceIncrement), 0),
        minNotional: numbers_1.nz(parseFloat(asset.quoteMinSize), 0.1),
    };
};
exports.formatTickerInfo = formatTickerInfo;
