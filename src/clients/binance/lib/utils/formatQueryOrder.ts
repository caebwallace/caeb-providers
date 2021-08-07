import { QueryOrderResult } from 'binance-api-node';
import { IOrder } from '../../../common/interfaces';
import { nz } from '../../../../utils/numbers/numbers';

/**
 * Format order to abstract provider model.
 *
 * @private
 * @param {QueryOrderResult} order - The order.
 * @returns {IOrder} - The formated order.
 * @memberof ProviderBinance
 */
export const formatQueryOrder = (order: QueryOrderResult, baseAsset: string, quoteAsset: string): IOrder => {
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
        origQuoteOrderQty: nz(parseFloat(order.origQuoteOrderQty), 0),
        createdAt: new Date(order.time),
        updatedAt: order.updateTime ? new Date(order.updateTime) : new Date(order.time),
    };
    if (!intermediate.price) {
        intermediate.price = intermediate.cummulativeQuoteQty / intermediate.origQty;
    }
    return intermediate;
};
