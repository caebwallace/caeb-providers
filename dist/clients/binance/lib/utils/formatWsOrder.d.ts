import { ExecutionReport } from 'binance-api-node';
import { IOrder } from '../../../common/interfaces';
export declare const formatWsOrder: (order: ExecutionReport, baseAsset: string, quoteAsset: string) => IOrder;
