import { IAsset } from '../../../../interfaces';
import { OrderSide, IOrder, OrderStatus, OrderType } from '../../../../interfaces/common/IOrder';
import { nz, roundToFloor } from '../../../../utils/numbers/numbers';

// {
//     id: '60c73bbd2ff046000652ba13',
//     symbol: 'UOS-USDT',
//     opType: 'DEAL',
//     type: 'limit',
//     side: 'buy',
//     price: '0.3938',
//     size: '23',
//     funds: '0',
//     dealFunds: '9.0574',
//     dealSize: '23',
//     fee: '0.0090574',
//     feeCurrency: 'USDT',
//     stp: '',
//     stop: '',
//     stopTriggered: false,
//     stopPrice: '0',
//     timeInForce: 'GTC',
//     postOnly: false,
//     hidden: false,
//     iceberg: false,
//     visibleSize: '0',
//     cancelAfter: 0,
//     channel: 'WEB',
//     clientOid: null,
//     remark: null,
//     tags: null,
//     isActive: false,
//     cancelExist: false,
//     createdAt: 1623669693924,
//     tradeType: 'TRADE',
//     baseAsset: 'UOS',
//     quoteAsset: 'USDT'
//   }

export interface KucoinOrder {
    id: string;
    symbol: string;
    opType: string;
    type: 'limit' | 'market';
    side: 'buy' | 'sell';
    price: string;
    size: string;
    funds: string;
    dealFunds: string;
    dealSize: string;
    fee: string;
    feeCurrency: string;
    stp: string;
    stop: string;
    stopTriggered: false;
    stopPrice: string;
    timeInForce: string;
    postOnly: boolean;
    hidden: boolean;
    iceberg: boolean;
    visibleSize: string;
    cancelAfter: number;
    channel: string;
    clientOid: null;
    remark: null;
    tags: null;
    isActive: boolean;
    cancelExist: boolean;
    createdAt: number;
    tradeType: 'TRADE' | 'MARGIN_TRADE';
    baseAsset: string;
    quoteAsset: string;
}

/**
 * Format order to abstract provider model.
 *
 * @private
 * @param {QueryOrderResult} order - The order.
 * @returns {IOrder} - The formated order.
 * @memberof ProviderBinance
 */
export const formatOrder = (order: KucoinOrder, tickerInfo: IAsset): IOrder => {
    const price = roundToFloor(nz(parseFloat(order.price), 0), tickerInfo.quotePrecision);
    const side = order.side === 'buy' ? OrderSide.BUY : OrderSide.SELL;
    const origQty = roundToFloor(nz(parseFloat(order.size), 0), tickerInfo.pricePrecision);
    const executedQty = roundToFloor(nz(parseFloat(order.dealSize), 0), tickerInfo.pricePrecision);
    const origQuoteOrderQty = roundToFloor(nz(parseFloat(order.funds), 0), tickerInfo.quotePrecision);
    const cummulativeQuoteQty = roundToFloor(nz(parseFloat(order.dealFunds), 0), tickerInfo.quotePrecision);
    const type = order.type === 'limit' ? OrderType.LIMIT : OrderType.MARKET;

    // Special case for status
    let status = OrderStatus.NEW;
    if (!order.isActive) {
        if (order.cancelExist) {
            status = OrderStatus.CANCELED;
        } else if (origQty === executedQty || type === OrderType.MARKET) {
            status = OrderStatus.FILLED;
        } else {
            status = OrderStatus.PARTIALLY_FILLED;
        }
    } else {
        if (executedQty > 0) {
            status = OrderStatus.PARTIALLY_FILLED;
        }
    }

    // Build order
    const intermediate: IOrder = {
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
        fee: nz(parseFloat(order.fee), 0),
        feeCurrency: order.feeCurrency,
        clientOrderId: order.clientOid,
    };

    if (!intermediate.price && type === 'MARKET') {
        intermediate.price = roundToFloor(nz(cummulativeQuoteQty / executedQty, 0), tickerInfo.quotePrecision);
    }

    return intermediate;
};
