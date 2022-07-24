'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatWsOrder = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatWsOrder = (order, baseAsset, quoteAsset) => {
    var _a;
    const intermediate = {
        baseAsset,
        quoteAsset,
        status: order.orderStatus,
        type: order.orderType,
        side: order.side,
        orderId: (_a = order.orderId) === null || _a === void 0 ? void 0 : _a.toString(),
        clientOrderId: order.newClientOrderId,
        price: (0, numbers_1.nz)(parseFloat(order.price), 0),
        origQty: (0, numbers_1.nz)(parseFloat(order.quantity), 0),
        cummulativeQuoteQty: (0, numbers_1.nz)(parseFloat(order.quantity) * parseFloat(order.price), 0),
        createdAt: new Date(order.creationTime),
        updatedAt: new Date(order.orderTime),
    };
    return intermediate;
};
exports.formatWsOrder = formatWsOrder;
