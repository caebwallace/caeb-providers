/// <reference types="pino" />
import { IAsset, IBalance, ICandle, IOrder, IProvider, OrderSide, ICandleChartIntervalKeys } from '../../../interfaces';
import { Logger } from '../../../utils/logger/logger';
import { IProviderKucoin } from '../interfaces/IProviderKucoin';
import { ProviderCommon } from '../../common/lib/index';
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
    constructor(props: IProviderKucoin);
    getExchangeInfo(): Promise<IAsset[]>;
    getPrice(baseAsset: string, quoteAsset: string): Promise<number>;
    getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset>;
    getHistory(baseAsset: string, quoteAsset: string, intervalType?: ICandleChartIntervalKeys, limit?: number): Promise<ICandle[]>;
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[]>;
    createOrderLimit(side: OrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder>;
    getAssetBalance(asset: string): Promise<IBalance>;
    listenUserEvents(): void;
    getApiRatioLimits(): Promise<any>;
    private __getAllOrders;
    private __getAllOrdersRequest;
}
