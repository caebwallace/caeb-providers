/// <reference types="pino" />
import { IBalance, ICandle, IOrder, IProvider, TOrderSide } from '../../common/interfaces';
import { Logger } from '../../../utils/logger/logger';
import { IProviderKucoin } from '../interfaces/IProviderKucoin';
import { ProviderCommon } from '../../common/lib';
import { IOrderMarketProps } from '../../common/interfaces/IOrder';
import { IAsset, ICandleChartIntervalKeys } from 'caeb-types';
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
    weightLimitLevels: {
        type: string;
        ratio: number;
        waitTimeMS: number;
    }[];
    client: any;
    private datafeed;
    private streamKeyDuplicate;
    log: Logger;
    private cacheSymbols;
    private cacheSymbolsLast;
    private cacheSymbolsTTL;
    private _weightLimitPerMinuteCalls;
    private historyLimitMax;
    constructor(props: IProviderKucoin);
    getApiRatioLimits(): Promise<any>;
    respectApiRatioLimits(): Promise<void>;
    private _onApiRatioLimitsErrorCode;
    getExchangeInfo(): Promise<IAsset[]>;
    getPrice(baseAsset: string, quoteAsset: string): Promise<number>;
    getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset>;
    getHistory(
        baseAsset: string,
        quoteAsset: string,
        intervalType?: ICandleChartIntervalKeys,
        opts?: {
            limit?: number;
            startDate?: Date;
            endDate?: Date;
        },
    ): Promise<ICandle[]>;
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAssetBalance(asset: string): Promise<IBalance>;
    getOrderById(orderId: string): Promise<IOrder>;
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
    createOrderMarket(props: IOrderMarketProps): Promise<IOrder>;
    attachStreamAccount(): Promise<void>;
    attachStreamTicker(baseAsset: string, quoteAsset: string): Promise<any>;
    private _attachStreamPrivateAccount;
    private _attachStreamPrivateOrder;
    private _onAccountStreamMessage;
    private _onAccountStreamOrder;
    private _onTickerStreamMessage;
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
