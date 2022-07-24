'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatCanceledOrder = void 0;
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatCanceledOrder = order => {
    const intermediate = {
        symbol: order.symbol,
        status: order.status,
        type: order.type,
        side: order.side,
        orderId: order.orderId,
        clientOrderId: order.clientOrderId,
        price: (0, numbers_1.nz)(parseFloat(order.price), 0),
        origQty: (0, numbers_1.nz)(parseFloat(order.origQty), 0),
        executedQty: (0, numbers_1.nz)(parseFloat(order.executedQty), 0),
        cummulativeQuoteQty: (0, numbers_1.nz)(parseFloat(order.cummulativeQuoteQty), 0),
        createdAt: new Date(),
    };
    return intermediate;
};
exports.formatCanceledOrder = formatCanceledOrder;
