import { ExecutionReport } from 'binance-api-node';
import { IOrder, OrderType } from '../../../../interfaces/common/IOrder';
import { nz } from '../../../../utils/numbers/numbers';

/**
 * Format a NEW order created.
 *
 * @private
 * @param {Order} order - The NEW order created.
 * @returns {IOrder} - The formated order.
 * @memberof ProviderBinance
 */
export const formatWsOrder = (order: ExecutionReport, baseAsset: string, quoteAsset: string): IOrder => {
    const intermediate: IOrder = {
        baseAsset,
        quoteAsset,
        status: order.orderStatus,
        type: order.orderType,
        side: order.side,
        orderId: order.orderId?.toString(),
        clientOrderId: order.newClientOrderId,
        price: nz(parseFloat(order.price), 0),
        origQty: nz(parseFloat(order.quantity), 0),
        cummulativeQuoteQty: nz(parseFloat(order.quantity) * parseFloat(order.price), 0),
        createdAt: new Date(order.creationTime),
        updatedAt: new Date(order.orderTime),
    };
    return intermediate;
};
