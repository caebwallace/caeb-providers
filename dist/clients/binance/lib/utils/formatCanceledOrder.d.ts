import { CancelOrderResult } from 'binance-api-node';
import { IOrder } from '../../../common/interfaces';
export declare const formatCanceledOrder: (order: CancelOrderResult) => IOrder;
