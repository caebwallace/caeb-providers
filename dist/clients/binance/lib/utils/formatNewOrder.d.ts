import { Order } from 'binance-api-node';
import { IOrder } from '../../../common/interfaces';
export declare const formatNewOrder: (order: Order, baseAsset: string, quoteAsset: string) => IOrder;
