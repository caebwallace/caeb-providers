'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatTickerInfo = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatTickerInfo = asset => {
    var _a, _b, _c, _d;
    const filterPrice = (_a = asset.filters) === null || _a === void 0 ? void 0 : _a.find(a => a.filterType === 'PRICE_FILTER');
    const filterLotSize = (_b = asset.filters) === null || _b === void 0 ? void 0 : _b.find(a => a.filterType === 'LOT_SIZE');
    const filterMaxNumOrders = (_c = asset.filters) === null || _c === void 0 ? void 0 : _c.find(a => a.filterType === 'MAX_NUM_ORDERS');
    const filterMinNotional = (_d = asset.filters) === null || _d === void 0 ? void 0 : _d.find(a => a.filterType === 'MIN_NOTIONAL');
    return {
        baseAsset: asset.baseAsset,
        quoteAsset: asset.quoteAsset,
        status: asset.status,
        pricePrecision: numbers_1.nz(parseFloat(asset.baseAssetPrecision), 8),
        quotePrecision: numbers_1.nz(parseFloat(asset.quotePrecision), 8),
        maxNumOrders: numbers_1.nz(filterMaxNumOrders === null || filterMaxNumOrders === void 0 ? void 0 : filterMaxNumOrders.maxNumOrders, 0),
        minPrice: numbers_1.nz(parseFloat(filterPrice === null || filterPrice === void 0 ? void 0 : filterPrice.minPrice), 0),
        maxPrice: numbers_1.nz(parseFloat(filterPrice === null || filterPrice === void 0 ? void 0 : filterPrice.maxPrice), 0),
        minQty: numbers_1.nz(parseFloat(filterLotSize === null || filterLotSize === void 0 ? void 0 : filterLotSize.minQty), 0),
        stepSize: numbers_1.nz(parseFloat(filterLotSize === null || filterLotSize === void 0 ? void 0 : filterLotSize.stepSize), 0),
        minNotional: numbers_1.nz(parseFloat(filterMinNotional === null || filterMinNotional === void 0 ? void 0 : filterMinNotional.minNotional), 0.1),
    };
};
exports.formatTickerInfo = formatTickerInfo;
