import { IOrder, OrderSide, OrderStatus, OrderType } from '../../../common/interfaces';
import { nz, roundToFloor } from '../../../../utils/numbers/numbers';
import { IAsset } from 'caeb-types';

// {
//     id: 60377083294,
//     clientId: null,
//     market: 'OXY/USD',
//     type: 'market',
//     side: 'buy',
//     price: null,
//     size: 11,
//     status: 'closed',
//     filledSize: 11,
//     remainingSize: 0,
//     reduceOnly: false,
//     liquidation: false,
//     avgFillPrice: 1.396,
//     postOnly: false,
//     ioc: true,
//     createdAt: '2021-06-26T22:25:46.134707+00:00',
//     future: null
//   },

export interface FtxOrder {
    id: number;
    clientId?: string;
    market: string;
    type: 'limit' | 'market';
    side: 'buy' | 'sell';
    price?: number;
    avgFillPrice?: number;
    size?: number;
    filledSize?: number;
    remainingSize?: number;
    status: 'closed' | 'open' | 'new';
    reduceOnly: boolean;
    liquidation: boolean;
    postOnly: boolean;
    ioc: boolean;
    createdAt: string;
}

/**
 * Format order to abstract provider model.
 *
 * @private
 * @param {QueryOrderResult} order - The order.
 * @returns {IOrder} - The formated order.
 */
export const formatOrder = (order: FtxOrder, tickerInfo: IAsset): IOrder => {
    const price = roundToFloor(nz(order.price || order.avgFillPrice, 0), tickerInfo.quotePrecision);
    const side = order.side === 'buy' ? OrderSide.BUY : OrderSide.SELL;
    const origQty = roundToFloor(nz(order.size, 0), tickerInfo.pricePrecision);
    const executedQty = roundToFloor(nz(order.filledSize, 0), tickerInfo.pricePrecision);
    const origQuoteOrderQty = roundToFloor(nz(price * origQty, 0), tickerInfo.quotePrecision);
    const cummulativeQuoteQty = roundToFloor(nz(price * executedQty, 0), tickerInfo.quotePrecision);
    const type = order.type === 'limit' ? OrderType.LIMIT : OrderType.MARKET;

    // Special case for status
    let status = OrderStatus.NEW;
    if (order.status === 'closed') {
        if (!executedQty) {
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
