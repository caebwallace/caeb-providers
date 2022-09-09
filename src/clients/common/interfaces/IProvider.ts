import { IAsset, ICandleChartIntervalKeys } from 'caeb-types';
import { EventEmitter } from 'events';

import { IBalance } from './IBalance';
import { ICandle } from './ICandle';
import { IOrder, IOrderMarketProps, OrderSide, TOrderSide } from './IOrder';

export enum TProviderTransferInnerType {
    FUNDING_TRADE = 'FUNDING_TRADE',
    TRADE_FUNDING = 'TRADE_FUNDING',
}

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
    getHistory(
        baseAsset: string,
        quoteAsset: string,
        intervalType?: ICandleChartIntervalKeys,
        opts?: { startDate?: Date; endDate?: Date; limit?: number },
    ): Promise<ICandle[]>;
    getVolatility(candles: ICandle[]): [low: number, high: number, variation: number];
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAssetBalance(asset: string): Promise<IBalance>;
    getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    createOrderLimit(side: TOrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder>;
    createOrderMarket(props: IOrderMarketProps): Promise<IOrder>;
    cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[] | boolean>;
    innerTransfer(clientOid: string, baseAsset: string, amount: number, transferType: keyof typeof TProviderTransferInnerType): Promise<string>;
    getApiRatioLimits(): Promise<any>;
    attachStreamAccount(): void;
    attachStreamTicker(baseAsset: string, quoteAsset: string): void;
}
