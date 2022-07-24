'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatQueryOrder = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatQueryOrder = (order, baseAsset, quoteAsset) => {
    var _a;
    const intermediate = {
        baseAsset,
        quoteAsset,
        status: order.status,
        type: order.type,
        side: order.side,
        orderId: (_a = order.orderId) === null || _a === void 0 ? void 0 : _a.toString(),
        clientOrderId: order.clientOrderId,
        price: (0, numbers_1.nz)(parseFloat(order.price), 0),
        origQty: (0, numbers_1.nz)(parseFloat(order.origQty), 0),
        executedQty: (0, numbers_1.nz)(parseFloat(order.executedQty), 0),
        cummulativeQuoteQty: (0, numbers_1.nz)(parseFloat(order.cummulativeQuoteQty), 0),
        origQuoteOrderQty: (0, numbers_1.nz)(parseFloat(order.origQuoteOrderQty), 0),
        createdAt: new Date(order.time),
        updatedAt: order.updateTime ? new Date(order.updateTime) : new Date(order.time),
    };
    if (!intermediate.price) {
        intermediate.price = intermediate.cummulativeQuoteQty / intermediate.origQty;
    }
    return intermediate;
};
exports.formatQueryOrder = formatQueryOrder;
