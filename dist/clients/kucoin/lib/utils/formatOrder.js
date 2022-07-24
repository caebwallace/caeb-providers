'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatOrder = void 0;
const interfaces_1 = require('../../../common/interfaces');
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatOrder = (order, tickerInfo) => {
    const price = (0, numbers_1.roundToFloor)((0, numbers_1.nz)(parseFloat(order.price), 0), tickerInfo.quotePrecision);
    const side = order.side === 'buy' ? interfaces_1.OrderSide.BUY : interfaces_1.OrderSide.SELL;
    const origQty = (0, numbers_1.roundToFloor)((0, numbers_1.nz)(parseFloat(order.size), 0), tickerInfo.pricePrecision);
    const executedQty = (0, numbers_1.roundToFloor)((0, numbers_1.nz)(parseFloat(order.dealSize), 0), tickerInfo.pricePrecision);
    const origQuoteOrderQty = (0, numbers_1.roundToFloor)((0, numbers_1.nz)(parseFloat(order.funds), 0), tickerInfo.quotePrecision);
    const cummulativeQuoteQty = (0, numbers_1.roundToFloor)((0, numbers_1.nz)(parseFloat(order.dealFunds), 0), tickerInfo.quotePrecision);
    const type = order.type === 'limit' ? interfaces_1.OrderType.LIMIT : interfaces_1.OrderType.MARKET;
    let status = interfaces_1.OrderStatus.NEW;
    if (!order.isActive) {
        if (order.cancelExist) {
            status = interfaces_1.OrderStatus.CANCELED;
        } else if (origQty === executedQty || type === interfaces_1.OrderType.MARKET) {
            status = interfaces_1.OrderStatus.FILLED;
        } else {
            status = interfaces_1.OrderStatus.PARTIALLY_FILLED;
        }
    } else {
        if (executedQty > 0) {
            status = interfaces_1.OrderStatus.PARTIALLY_FILLED;
        }
    }
    const intermediate = {
        orderId: order.id,
        baseAsset: order.baseAsset,
        quoteAsset: order.quoteAsset,
        status,
        type,
        side,
        price,
        origQty,
        executedQty,
        origQuoteOrderQty,
        cummulativeQuoteQty,
        createdAt: new Date(order.createdAt),
        fee: (0, numbers_1.nz)(parseFloat(order.fee), 0),
        feeCurrency: order.feeCurrency,
        clientOrderId: order.clientOid,
    };
    if (!intermediate.price && type === 'MARKET') {
        intermediate.price = (0, numbers_1.roundToFloor)((0, numbers_1.nz)(cummulativeQuoteQty / executedQty, 0), tickerInfo.quotePrecision);
    }
    return intermediate;
};
exports.formatOrder = formatOrder;
