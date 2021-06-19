import { Order } from 'binance-api-node';
import { IOrder } from '../../../../interfaces/';
export declare const formatNewOrder: (order: Order, baseAsset: string, quoteAsset: string) => IOrder;
