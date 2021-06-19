'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.formatOrder = void 0;
const IOrder_1 = require('../../../../interfaces/common/IOrder');
const numbers_1 = require('../../../../utils/numbers/numbers');
const formatOrder = (order, tickerInfo) => {
    const price = numbers_1.roundToFloor(numbers_1.nz(parseFloat(order.price), 0), tickerInfo.quotePrecision);
    const side = order.side === 'buy' ? IOrder_1.OrderSide.BUY : IOrder_1.OrderSide.SELL;
    const origQty = numbers_1.roundToFloor(numbers_1.nz(parseFloat(order.size), 0), tickerInfo.pricePrecision);
    const executedQty = numbers_1.roundToFloor(numbers_1.nz(parseFloat(order.dealSize), 0), tickerInfo.pricePrecision);
    const origQuoteOrderQty = numbers_1.roundToFloor(numbers_1.nz(parseFloat(order.funds), 0), tickerInfo.quotePrecision);
    const cummulativeQuoteQty = numbers_1.roundToFloor(numbers_1.nz(parseFloat(order.dealFunds), 0), tickerInfo.quotePrecision);
    const type = order.type === 'limit' ? IOrder_1.OrderType.LIMIT : IOrder_1.OrderType.MARKET;
    let status = IOrder_1.OrderStatus.NEW;
    if (!order.isActive) {
        if (order.cancelExist) {
            status = IOrder_1.OrderStatus.CANCELED;
        } else if (origQty === executedQty || type === IOrder_1.OrderType.MARKET) {
            status = IOrder_1.OrderStatus.FILLED;
        } else {
            status = IOrder_1.OrderStatus.PARTIALLY_FILLED;
        }
    } else {
        if (executedQty > 0) {
            status = IOrder_1.OrderStatus.PARTIALLY_FILLED;
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
        fee: numbers_1.nz(parseFloat(order.fee), 0),
        feeCurrency: order.feeCurrency,
        clientOrderId: order.clientOid,
    };
    if (!intermediate.price && type === 'MARKET') {
        intermediate.price = numbers_1.roundToFloor(numbers_1.nz(cummulativeQuoteQty / executedQty, 0), tickerInfo.quotePrecision);
    }
    return intermediate;
};
exports.formatOrder = formatOrder;
