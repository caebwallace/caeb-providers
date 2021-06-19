import { CancelOrderResult } from 'binance-api-node';
import { IOrder } from '../../../../interfaces/';
export declare const formatCanceledOrder: (order: CancelOrderResult) => IOrder;
