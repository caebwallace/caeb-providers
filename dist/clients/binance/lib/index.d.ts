/// <reference types="pino" />
import { Binance, OrderSide, ReconnectingWebSocketHandler } from 'binance-api-node';
import { IProviderBinance } from '../interfaces/IProviderBinance';
import { Logger } from '../../../utils/logger/logger';
import { IAsset, IBalance, ICandle, ICandleChartIntervalKeys, IOrder, IProvider } from '../../common/interfaces';
import { ProviderCommon } from '../../common/lib';
export declare class ProviderBinance extends ProviderCommon implements IProvider {
    name: string;
    readonly id: string;
    httpBase: string;
    readonly httpBaseTestnet: string;
    testnet: boolean;
    apiKey: string;
    apiSecret: string;
    client: Binance;
    recvWindow: number;
    weightLimitPerMinute: number;
    log: Logger;
    private cacheSymbols;
    private cacheSymbolsLast;
    private cacheSymbolsTTL;
    constructor(props: IProviderBinance);
    apiPassPhrase?: string;
    subAccountId?: string | number;
    getExchangeInfo(): Promise<IAsset[]>;
    getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset>;
    getHistory(baseAsset: string, quoteAsset: string, intervalType?: ICandleChartIntervalKeys, limit?: number): Promise<ICandle[]>;
    getPrice(baseAsset: string, quoteAsset: string): Promise<number>;
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAssetBalance(asset: string): Promise<IBalance>;
    getAllOrdersForPairs(
        pairs: {
            baseAsset: string;
            quoteAsset: string;
        }[],
        status?: string,
        daysRange?: number,
    ): Promise<IOrder[]>;
    getAllOrders(baseAsset: string, quoteAsset: string, orderId?: number): Promise<IOrder[]>;
    getActiveOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[]>;
    createOrderLimit(side: OrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder>;
    cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[] | boolean>;
    listenUserEvents(): Promise<ReconnectingWebSocketHandler>;
    getApiRatioLimits(): Promise<any>;
    wsPing(): Promise<boolean>;
}
export { Binance };
