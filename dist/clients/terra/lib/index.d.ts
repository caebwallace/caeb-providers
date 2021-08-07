import { IAsset, IBalance, ICandle, ICandleChartIntervalKeys, IOrder, IProvider } from '../../common/interfaces';
import { ProviderCommon } from '../../common/lib';
import { IProviderTerra } from './interfaces/IProviderTerra';
export declare class ProviderTerra extends ProviderCommon implements IProvider {
    name: string;
    readonly id: string;
    apiKey: string;
    apiSecret: string;
    apiPassPhrase?: string;
    subAccountId?: string | number;
    testnet?: boolean;
    client: any;
    constructor(props: IProviderTerra);
    getExchangeInfo(): Promise<IAsset[]>;
    getPrice(baseAsset: string, quoteAsset: string): Promise<number>;
    getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset>;
    getHistory(baseAsset: string, quoteAsset: string, intervalType?: ICandleChartIntervalKeys, limit?: number): Promise<ICandle[]>;
    formatSymbol(baseAsset: string, quoteAsset: string): string;
    getAccountBalances(): Promise<IBalance[]>;
    getAssetBalance(asset: string): Promise<IBalance>;
    getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]>;
    createOrderLimit(side: 'BUY' | 'SELL', quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder>;
    cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<boolean | IOrder[]>;
    listenUserEvents(): void;
}
