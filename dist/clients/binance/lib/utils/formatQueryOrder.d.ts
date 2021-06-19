import { QueryOrderResult } from 'binance-api-node';
import { IOrder } from '../../../../interfaces/';
export declare const formatQueryOrder: (order: QueryOrderResult, baseAsset: string, quoteAsset: string) => IOrder;
