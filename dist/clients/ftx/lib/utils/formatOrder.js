'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatOrder = void 0;
const interfaces_1 = require('../../../common/interfaces');
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatOrder = (order, tickerInfo) => {
    const price = numbers_1.roundToFloor(numbers_1.nz(order.price || order.avgFillPrice, 0), tickerInfo.quotePrecision);
    const side = order.side === 'buy' ? interfaces_1.OrderSide.BUY : interfaces_1.OrderSide.SELL;
    const origQty = numbers_1.roundToFloor(numbers_1.nz(order.size, 0), tickerInfo.pricePrecision);
    const executedQty = numbers_1.roundToFloor(numbers_1.nz(order.filledSize, 0), tickerInfo.pricePrecision);
    const origQuoteOrderQty = numbers_1.roundToFloor(numbers_1.nz(price * origQty, 0), tickerInfo.quotePrecision);
    const cummulativeQuoteQty = numbers_1.roundToFloor(numbers_1.nz(price * executedQty, 0), tickerInfo.quotePrecision);
    const type = order.type === 'limit' ? interfaces_1.OrderType.LIMIT : interfaces_1.OrderType.MARKET;
    let status = interfaces_1.OrderStatus.NEW;
    if (order.status === 'closed') {
        if (!executedQty) {
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
        orderId: order.id.toString(),
        baseAsset: tickerInfo.baseAsset,
        quoteAsset: tickerInfo.quoteAsset,
        status,
        type,
        side,
        price,
        origQty,
        executedQty,
        origQuoteOrderQty,
        cummulativeQuoteQty,
        createdAt: new Date(order.createdAt),
        clientOrderId: order.clientId,
    };
    return intermediate;
};
exports.formatOrder = formatOrder;
