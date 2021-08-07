/// <reference types="pino" />
import { RestClient as ClientFtx } from 'ftx-api';
import { IAsset, IBalance, ICandle, IOrder, IProvider, TOrderSide, ICandleChartIntervalKeys } from '../../common/interfaces';
import { Logger } from '../../../utils/logger/logger';
import { IProviderFtx } from '../interfaces/IProviderFtx';
import { ProviderCommon } from '../../common/lib';
export declare class ProviderFtx extends ProviderCommon implements IProvider {
    name: string;
    readonly id: string;
    apiKey: string;
    apiSecret: string;
    subAccountName: string;
    weightLimitPerMinute: number;
    client: ClientFtx;
    log: Logger;
    private cacheSymbols;
    private cacheSymbolsLast;
    private cacheSymbolsTTL;
    constructor(props: IProviderFtx);
    getApiRatioLimits(): Promise<any>;
    getExchangeInfo(): Promise<IAsset[]>;
    getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset>;
    getPrice(baseAsset: string, quoteAsset: string): Promise<number>;
    getHistory(baseAsset: string, quoteAsset: string, intervalType?: ICandleChartIntervalKeys, limit?: number): Promise<ICandle[]>;
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAssetBalance(asset: string): Promise<IBalance>;
    getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    getAllOrdersForPairs(
        pairs?: {
            baseAsset: string;
            quoteAsset: string;
        }[],
        status?: string,
        daysRange?: number,
    ): Promise<IOrder[]>;
    createOrderLimit(side: TOrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder>;
    cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[] | boolean>;
    listenUserEvents(): void;
    private __getAllOrdersRequest;
}
