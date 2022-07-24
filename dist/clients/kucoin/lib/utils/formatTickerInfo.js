'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatTickerInfo = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatTickerInfo = asset => {
    return {
        baseAsset: asset.baseCurrency,
        quoteAsset: asset.quoteCurrency,
        status: asset.enableTrading ? 'TRADING' : 'LISTING',
        pricePrecision: (0, numbers_1.nz)((0, numbers_1.countDecimals)(parseFloat(asset.baseIncrement)), 8),
        quotePrecision: (0, numbers_1.nz)((0, numbers_1.countDecimals)(parseFloat(asset.quoteIncrement)), 8),
        minPrice: (0, numbers_1.nz)(parseFloat(asset.baseMinSize), 0),
        maxPrice: (0, numbers_1.nz)(parseFloat(asset.baseMaxSize), 0),
        minQty: (0, numbers_1.nz)(parseFloat(asset.baseMinSize), 0),
        stepSize: (0, numbers_1.nz)(parseFloat(asset.baseIncrement), 0),
        minNotional: (0, numbers_1.nz)(parseFloat(asset.quoteMinSize), 0.1),
    };
};
exports.formatTickerInfo = formatTickerInfo;
