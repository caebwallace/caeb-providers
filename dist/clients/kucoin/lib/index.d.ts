/// <reference types="pino" />
import { IAsset, IBalance, ICandle, IOrder, IProvider, TOrderSide, ICandleChartIntervalKeys } from '../../common/interfaces';
import { Logger } from '../../../utils/logger/logger';
import { IProviderKucoin } from '../interfaces/IProviderKucoin';
import { ProviderCommon } from '../../common/lib';
export declare class ProviderKucoin extends ProviderCommon implements IProvider {
    name: string;
    readonly id: string;
    httpBase: string;
    readonly httpBaseTestnet: string;
    testnet: boolean;
    apiKey: string;
    apiSecret: string;
    apiPassPhrase: string;
    weightLimitPerMinute: number;
    client: any;
    log: Logger;
    private cacheSymbols;
    private cacheSymbolsLast;
    private cacheSymbolsTTL;
    constructor(props: IProviderKucoin);
    getExchangeInfo(): Promise<IAsset[]>;
    getPrice(baseAsset: string, quoteAsset: string): Promise<number>;
    getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset>;
    getHistory(baseAsset: string, quoteAsset: string, intervalType?: ICandleChartIntervalKeys, limit?: number): Promise<ICandle[]>;
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAssetBalance(asset: string): Promise<IBalance>;
    getAllOrdersForPairs(
        pairs?: {
            baseAsset: string;
            quoteAsset: string;
        }[],
        status?: 'done' | 'active',
        daysRange?: number,
    ): Promise<IOrder[]>;
    getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[]>;
    createOrderLimit(side: TOrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder>;
    listenUserEvents(): void;
    getApiRatioLimits(): Promise<any>;
    private __getAllOrders;
    private __getAllOrdersRequest;
    private __getAllHistoricalOrders;
    __getAllOrdersPerPage(
        obj: any,
        currentPage?: number,
        pageSize?: number,
    ): Promise<{
        orders: IOrder[];
        currentPage: number;
        pageSize: number;
        totalNum: number;
        totalPage: number;
    }>;
}
