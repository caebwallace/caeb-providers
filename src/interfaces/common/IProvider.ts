import { EventEmitter } from 'events';
import { IAsset } from './IAsset';
import { IBalance } from './IBalance';
import { ICandle } from './ICandle';
import { IOrder } from './IOrder';
import { OrderSide } from './OrderSide';
import { ICandleChartIntervalKeys } from './ICandleChartInterval';

export interface IProvider extends EventEmitter {
    id: string;
    name: string;
    apiKey: string;
    apiSecret: string;
    apiPassPhrase?: string;
    subAccountId?: string | number;
    testnet?: boolean;
    getExchangeInfo(): Promise<IAsset[]>;
    getPrice(baseAsset: string, quoteAsset: string): Promise<number>;
    getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset>;
    getHistory(baseAsset: string, quoteAsset: string, intervalType?: ICandleChartIntervalKeys, limit?: number): Promise<ICandle[]>;
    getVolatility(candles: ICandle[]): [low: number, high: number, variation: number];
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAssetBalance(asset: string): Promise<IBalance>;
    getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    createOrderLimit(side: OrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder>;
    cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[]>;
    getApiRatioLimits(): Promise<any>;
    listenUserEvents(): void;
}
