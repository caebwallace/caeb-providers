import { IOrder } from '../../../common/interfaces';
import { IAsset } from 'caeb-types';
export interface FtxOrder {
    id: number;
    clientId?: string;
    market: string;
    type: 'limit' | 'market';
    side: 'buy' | 'sell';
    price?: number;
    avgFillPrice?: number;
    size?: number;
    filledSize?: number;
    remainingSize?: number;
    status: 'closed' | 'open' | 'new';
    reduceOnly: boolean;
    liquidation: boolean;
    postOnly: boolean;
    ioc: boolean;
    createdAt: string;
}
export declare const formatOrder: (order: FtxOrder, tickerInfo: IAsset) => IOrder;
