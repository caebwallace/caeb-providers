import { CancelOrderResult } from 'binance-api-node';
import { IOrder } from '../../../../interfaces/';
import { nz } from '../../../../utils/numbers/numbers';

/**
 * Format a CANCELED order.
 *
 * @private
 * @param {CancelOrderResult} order - The CANCELED order.
 * @returns {IOrder} - The formated order.
 * @memberof ProviderBinance
 */
export const formatCanceledOrder = (order: CancelOrderResult): IOrder => {
    const intermediate: any = {
        symbol: order.symbol,
        status: order.status,
        type: order.type,
        side: order.side,
        orderId: order.orderId,
        clientOrderId: order.clientOrderId,
        price: nz(parseFloat(order.price), 0),
        origQty: nz(parseFloat(order.origQty), 0),
        executedQty: nz(parseFloat(order.executedQty), 0),
        cummulativeQuoteQty: nz(parseFloat(order.cummulativeQuoteQty), 0),
        createdAt: new Date(),
    };
    return intermediate;
};
