import { ExecutionReport } from 'binance-api-node';
import { IOrder } from '../../../../interfaces/common/IOrder';
export declare const formatWsOrder: (order: ExecutionReport, baseAsset: string, quoteAsset: string) => IOrder;
