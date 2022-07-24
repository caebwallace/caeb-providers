import { RestClient as ClientFtx } from 'ftx-api';
import { IBalance, ICandle, IOrder, IProvider, TOrderSide, OrderSide } from '../../common/interfaces';
// import { CandleChartInterval } from '../interfaces/CandleChartInterval';
import { createLogger, Logger } from '../../../utils/logger/logger';
import { IProviderFtx } from '../interfaces/IProviderFtx';
import { formatTickerInfo } from './utils/formatTickerInfo';
import { formatBalances } from './utils/formatBalances';
import { formatOrder } from './utils/formatOrder';
import { formatCandle, FtxKline } from './utils/formatCandle';
import { ErrorInvalidSymbol } from '../../../utils/errors/ErrorInvalidSymbol';
import { roundToFloor } from '../../../utils/numbers/numbers';
import { ProviderCommon } from '../../common/lib';
import { CandleChartInterval } from '../interfaces/CandleChartInterval';
import { IOrderMarketProps } from '../../common/interfaces/IOrder';
import { IAsset, ICandleChartIntervalInSeconds, ICandleChartIntervalKeys } from 'caeb-types';

// Provider for FTX
export class ProviderFtx extends ProviderCommon implements IProvider {
    /**
     * The name of the provider.
     *
     * @type {string}
     * @memberof ProviderFtx
     */
    public name: string = 'ftx';

    /**
     * The id of the provider (readonly).
     *
     * @type {string}
     * @memberof ProviderFtx
     */
    public readonly id: string = 'ftx';

    /**
     * The API key.
     *
     * @type {string}
     * @memberof ProviderFtx
     */
    public apiKey: string;

    /**
     * The API secret key.
     *
     * @type {string}
     * @memberof ProviderFtx
     */
    public apiSecret: string;

    /**
     * The subaccount name.
     *
     * @type {string}
     * @memberof ProviderFtx
     */
    public subAccountName: string;

    /**
     * Define the max wheight to avoid banning.
     *
     * @type {number}
     * @memberof ProviderFtx
     */
    public weightLimitPerMinute: number = 1800;

    /**
     * The client for RESTFUL and WebSocket API.
     *
     * @type {ClientFtx}
     * @memberof ProviderFtx
     */
    public client: ClientFtx;

    /**
     * The logger.
     *
     * @type {Logger}
     * @memberof ProviderFtx
     */
    public log: Logger;

    // Cache symbols
    private cacheSymbols: IAsset[];
    private cacheSymbolsLast: number;
    private cacheSymbolsTTL: number = 60 * 60 * 1000;

    /**
     * Init the Provider with config.
     *
     * @param {IProviderFtx} props - The class properties.
     * @memberof ProviderFtx
     */
    constructor(props: IProviderFtx) {
        super();

        // Set config
        if (props && props.name) this.name = props.name;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.subAccountName) this.subAccountName = props.subAccountName;

        // Create logger
        this.log = createLogger(this.name.toUpperCase());

        // Create client
        this.client = new ClientFtx(this.apiKey, this.apiSecret, {
            subAccountName: this.subAccountName,
        });
    }
    apiPassPhrase?: string;
    subAccountId?: string | number;
    testnet?: boolean;
    attachStreamTicker(ticker: string): void {
        throw new Error('Method not implemented.');
    }

    ////////////////////////////////////////////////// PUBLIC METHODS ///////////

    public async getApiRatioLimits(): Promise<any> {
        // console.log('API Ratio', this.client);
        // throw new Error('Method not implemented.');
    }

    public async getExchangeInfo(): Promise<IAsset[]> {
        if (this.cacheSymbols && this.cacheSymbols.length && Date.now() - this.cacheSymbolsLast < this.cacheSymbolsTTL) {
            return this.cacheSymbols;
        }
        await this.respectApiRatioLimits();
        const { result: symbols } = await this.client.getMarkets();
        this.cacheSymbols = symbols.filter((s: any) => s.type === 'spot').map((symbol: any) => formatTickerInfo(symbol));
        this.cacheSymbolsLast = Date.now();
        return this.cacheSymbols;
    }

    public async getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset> {
        const symbols = await this.getExchangeInfo();
        const asset = symbols.find((s: any) => s.baseAsset === baseAsset && s.quoteAsset === quoteAsset);
        if (!asset) throw new ErrorInvalidSymbol(`${baseAsset} / ${quoteAsset}`);
        return asset;
    }

    public async getPrice(baseAsset: string, quoteAsset: string): Promise<number> {
        await this.respectApiRatioLimits();
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const { result: ticker } = await await this.client.getMarket(symbol);
        const price = parseFloat(ticker.last);
        return price;
    }

    public async getHistory(
        baseAsset: string,
        quoteAsset: string,
        intervalType: ICandleChartIntervalKeys = ICandleChartIntervalKeys.ONE_DAY,
        opts: {
            limit?: number;
            startDate?: Date;
            endDate?: Date;
        } = { limit: 200 },
    ): Promise<ICandle[]> {
        await this.respectApiRatioLimits();

        // Init symbol and interval type
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const interval = CandleChartInterval[intervalType] as unknown as number;

        // Calculate limits
        const intervalMs = ICandleChartIntervalInSeconds[intervalType] * 1000;
        const startAt = roundToFloor((Date.now() - intervalMs * opts.limit) / 1000, 0);
        const endAt = roundToFloor(Date.now() / 1000, 0);

        // Get klines and format
        const { result: candles } = await this.client.getHistoricalPrices({
            market_name: symbol,
            resolution: interval,
            start_time: startAt,
            end_time: endAt,
        });
        return candles.map((candle: FtxKline) => formatCandle(candle, intervalMs));
    }

    public formatSymbol(baseAsset: string, quoteAsset: string): string {
        return `${baseAsset}/${quoteAsset}`;
    }

    ////////////////////////////////////////////////// USER METHODS ///////////

    public async getAccountBalances(): Promise<IBalance[]> {
        await this.respectApiRatioLimits();
        const { result: balances } = await this.client.getBalances();
        return formatBalances(balances || []);
    }

    public async getAssetBalance(asset: string): Promise<IBalance> {
        const balances = await this.getAccountBalances();
        return balances.find(a => a.asset === asset);
    }

    ////////////////////////////////////////////////// USER METHODS : ORDERS ///////////
    public async getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]> {
        return await this.__getAllOrdersRequest(baseAsset, quoteAsset, 'done', daysRange);
    }

    public async getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]> {
        return await this.__getAllOrdersRequest(baseAsset, quoteAsset, 'active', daysRange);
    }

    public async getAllOrdersForPairs(pairs?: { baseAsset: string; quoteAsset: string }[], status?: string, daysRange?: number): Promise<IOrder[]> {
        throw new Error('Method not implemented.');
    }

    public async createOrderLimit(side: TOrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder> {
        await this.respectApiRatioLimits();
        const { result: order } = await this.client.placeOrder({
            market: this.formatSymbol(baseAsset, quoteAsset),
            side: side === OrderSide.BUY ? 'buy' : 'sell',
            price,
            size: quantity,
            type: 'limit',
            postOnly: true,
        });
        const tickerInfo = await this.getTickerInfo(baseAsset, quoteAsset);
        return formatOrder({ ...order, baseAsset, quoteAsset }, tickerInfo);
    }

    public async createOrderMarket(props: IOrderMarketProps): Promise<IOrder> {
        await this.respectApiRatioLimits();
        throw new Error('Method not implemented.');
    }

    public async cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[] | boolean> {
        await this.respectApiRatioLimits();
        const { result, success } = await this.client.cancelAllOrders({ market: this.formatSymbol(baseAsset, quoteAsset) });
        return success;
    }

    attachStreamAccount(): void {
        throw new Error('Method not implemented.');
    }

    ////////////////////////////////////////////////// PRIVATE METHODS ///////////

    private async __getAllOrdersRequest(baseAsset?: string, quoteAsset?: string, status?: 'done' | 'active', daysRange: number = 365): Promise<IOrder[]> {
        await this.respectApiRatioLimits();

        // Setup
        const orders: IOrder[] = [];

        // Define date range
        const dailyMs = 86400 * 1000;
        const startAt = roundToFloor((Date.now() - dailyMs * daysRange) / 1000, 0);
        const endAt = roundToFloor(Date.now() / 1000, 0);

        // Sync market if no symbols in cache
        if (!this.cacheSymbols || !this.cacheSymbols.length) {
            await this.getExchangeInfo();
        }

        // If symbol is defined
        const symbol = baseAsset && quoteAsset ? this.formatSymbol(baseAsset, quoteAsset) : undefined;

        // Prepare request
        let opts: { market: string };
        if (symbol) opts = { market: symbol };

        // Fetch request
        const { success, result, hasMoreData } =
            status === 'active'
                ? await this.client.getOpenOrders(symbol)
                : await this.client.getOrderHistory({ ...opts, start_time: startAt, end_time: endAt });

        // console.log(opts, result, result.length, success, hasMoreData);

        // Format orders
        if (result && result.length) {
            for (const item of result) {
                const [marketBaseAsset, marketQuoteAsset] = item.market.split('/');
                const tickerInfo = await this.getTickerInfo(marketBaseAsset, marketQuoteAsset);
                orders.push(formatOrder({ ...item, marketBaseAsset, marketQuoteAsset }, tickerInfo));
            }
        }
        return orders;
    }
}
