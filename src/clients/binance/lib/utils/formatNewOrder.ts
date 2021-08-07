import { Order } from 'binance-api-node';
import { IOrder } from '../../../common/interfaces';
import { nz } from '../../../../utils/numbers/numbers';

/**
 * Format a NEW order created.
 *
 * @private
 * @param {Order} order - The NEW order created.
 * @returns {IOrder} - The formated order.
 * @memberof ProviderBinance
 */
export const formatNewOrder = (order: Order, baseAsset: string, quoteAsset: string): IOrder => {
    const intermediate: IOrder = {
        baseAsset,
        quoteAsset,
        status: order.status,
        type: order.type,
        side: order.side,
        orderId: order.orderId?.toString(),
        clientOrderId: order.clientOrderId,
        price: nz(parseFloat(order.price), 0),
        origQty: nz(parseFloat(order.origQty), 0),
        executedQty: nz(parseFloat(order.executedQty), 0),
        cummulativeQuoteQty: nz(parseFloat(order.cummulativeQuoteQty), 0),
        createdAt: new Date(order.transactTime),
    };
    return intermediate;
};
