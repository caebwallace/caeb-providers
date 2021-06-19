const ClientKucoin = require('kucoin-node-sdk');

import pLimit from 'p-limit';
import { IAsset, IBalance, ICandle, IOrder, IProvider, OrderSide, ICandleChartIntervalKeys, ICandleChartIntervalInSeconds } from '../../../interfaces';
import { CandleChartInterval } from '../interfaces/CandleChartInterval';
import { createLogger, Logger } from '../../../utils/logger/logger';
import { IProviderKucoin } from '../interfaces/IProviderKucoin';
import { formatTickerInfo } from './utils/formatTickerInfo';
import { formatBalances } from './utils/formatBalances';
import { formatOrder } from './utils/formatOrder';
import { ErrorInvalidSymbol } from '../../../utils/errors/ErrorInvalidSymbol';
import { formatCandle, KucoinKline } from './utils/formatCandle';
import { roundToFloor } from '../../../utils/numbers/numbers';
import { ProviderCommon } from '../../common/lib/index';

// Provider for Kucoin
export class ProviderKucoin extends ProviderCommon implements IProvider {
    /**
     * The name of the provider.
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public name: string = 'kucoin';

    /**
     * The id of the provider (readonly).
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public readonly id: string = 'kucoin';

    /**
     * The API url.
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public httpBase: string = 'https://openapi-v2.kucoin.com';

    /**
     * The testnet API url.
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public readonly httpBaseTestnet: string = 'https://openapi-sandbox.kucoin.com';

    /**
     * Use testnet.
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public testnet: boolean = false;

    /**
     * The API key (https://kucoin.com/account/api).
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public apiKey: string;

    /**
     * The API secret key.
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public apiSecret: string;

    /**
     * The API passphrase.
     *
     * @type {string}
     * @memberof ProviderKucoin
     */
    public apiPassPhrase: string;

    /**
     * Define the max wheight to avoid banning.
     *
     * @type {Binance}
     * @memberof ProviderKucoin
     */
    public weightLimitPerMinute: number = 1800;

    /**
     * The client for RESTFUL and WebSocket API.
     *
     * @type {Binance}
     * @memberof ProviderKucoin
     */
    public client: any = ClientKucoin;

    /**
     * The logger.
     *
     * @type {Logger}
     * @memberof ProviderKucoin
     */
    public log: Logger;

    /**
     * Init the Provider with config.
     *
     * @param {IProviderKucoinConfig} props - The class properties.
     * @memberof ProviderKucoin
     */
    constructor(props: IProviderKucoin) {
        super();

        // Set config
        if (props && props.name) this.name = props.name;
        if (props && props.httpBase) this.httpBase = props.httpBase;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.apiPassPhrase) this.apiPassPhrase = props.apiPassPhrase;
        if (props && props.testnet) this.testnet = props.testnet;

        // Configure to use testnet
        if (!props.httpBase && props.testnet) {
            this.httpBase = this.httpBaseTestnet;
        }

        // Create logger
        this.log = createLogger(this.name.toUpperCase());

        // Create client
        this.client.init({
            baseUrl: this.httpBase,
            apiAuth: {
                key: this.apiKey,
                secret: this.apiSecret,
                passphrase: this.apiPassPhrase,
            },
            authVersion: 2,
        });
    }

    //////////////////////////////////////////////// PUBLIC METHODS ///////////

    /**
     * Get exchange infos for all tickers.
     *
     * @private
     * @returns {array} - The list of all symbols.
     * @memberof ProviderKucoin
     */
    public async getExchangeInfo(): Promise<IAsset[]> {
        await this.respectApiRatioLimits();
        const { data: symbols } = await this.client.rest.Market.Symbols.getSymbolsList();
        return symbols.map((symbol: any) => formatTickerInfo(symbol));
    }

    /**
     * Get the price of a pair.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {Promise<number>} - The last price.
     * @memberof ProviderBinance
     */
    public async getPrice(baseAsset: string, quoteAsset: string): Promise<number> {
        await this.respectApiRatioLimits();
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const { data: ticker } = await this.client.rest.Market.Symbols.getTicker(symbol);
        const price = parseFloat(ticker.price);
        return price;
    }

    /**
     * Get the asset details from exchangeInfo.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {Promise<IAsset>} - The formated asset.
     * @memberof ProviderBinance
     */
    public async getTickerInfo(baseAsset: string, quoteAsset: string): Promise<IAsset> {
        const symbols = await this.getExchangeInfo();
        const asset = symbols.find((s: any) => s.baseAsset === baseAsset && s.quoteAsset === quoteAsset);
        if (!asset) throw new ErrorInvalidSymbol(`${baseAsset} / ${quoteAsset}`);
        return asset;
    }

    /**
     * Get candles history for a pair.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @param {ICandleChartIntervalKeys} [intervalKey=ICandleChartIntervalKeys.ONE_DAY] - The type of interval.
     * @param {number} [limit=200] - The limit.
     * @returns {Promise<ICandle[]>}
     * @memberof ProviderBinance
     */
    public async getHistory(
        baseAsset: string,
        quoteAsset: string,
        intervalType: ICandleChartIntervalKeys = ICandleChartIntervalKeys.ONE_DAY,
        limit: number = 200,
    ): Promise<ICandle[]> {
        await this.respectApiRatioLimits();

        // Init symbol and interval type
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const interval = CandleChartInterval[intervalType];

        // Calculate limits
        const intervalMs = ICandleChartIntervalInSeconds[intervalType] * 1000;
        const startAt = roundToFloor((Date.now() - intervalMs * limit) / 1000, 0);
        const endAt = roundToFloor(Date.now() / 1000, 0);

        // Fetch klines
        const { data: candles } = await this.client.rest.Market.Histories.getMarketCandles(symbol, interval, { startAt, endAt });

        // Format to abstract ICandle[]
        return candles.map((candle: KucoinKline) => formatCandle(candle, intervalMs));
    }

    /**
     * Build the symbol pair name from base and quote assets.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {string} - The symbol pair name.
     * @memberof ProviderKucoin
     */
    public formatSymbol(baseAsset: string, quoteAsset: string): string {
        return `${baseAsset}-${quoteAsset}`;
    }

    ////////////////////////////////////////////////// USER METHODS ///////////

    /**
     * Get account balances.
     *
     * @returns {Promise<IBalance[]>} - Array of balances.
     * @memberof ProviderKucoin
     */
    public async getAccountBalances(): Promise<IBalance[]> {
        await this.respectApiRatioLimits();
        const { data: balances } = await this.client.rest.User.Account.getAccountsList();
        return formatBalances(balances || []);
    }

    /**
     * Get All 'done' orders for a symbol.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {IOrder[]} - The list of orders.
     * @memberof ProviderKucoin
     */
    public async getAllOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]> {
        return await this.__getAllOrders(baseAsset, quoteAsset, 'done', 'TRADE', daysRange);
    }

    /**
     * Get All 'active' orders for a symbol.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {IOrder[]} - The list of orders.
     * @memberof ProviderKucoin
     */
    public async getActiveOrders(baseAsset: string, quoteAsset: string, daysRange?: number): Promise<IOrder[]> {
        return await this.__getAllOrders(baseAsset, quoteAsset, 'active', 'TRADE', daysRange);
    }

    /**
     * Cancel Open Orders.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {Promise<IOrder[]>} - The closed orders.
     * @memberof ProviderBinance
     */
    public async cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[]> {
        await this.respectApiRatioLimits();
        const tickerInfo = await this.getTickerInfo(baseAsset, quoteAsset);
        const orders: IOrder[] = [];
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const { data } = await this.client.rest.Trade.Orders.cancelAllOrders({ symbol });

        // console.log('cancelOpenOrders', symbol, await this.client.rest.Trade.Orders.cancelAllOrders({ symbol }));
        if (!data || !data.cancelledOrderIds) {
            return orders;
        }
        for (const orderId of data.cancelledOrderIds) {
            const { data: item } = await this.client.rest.Trade.Orders.getOrderByID(orderId);
            orders.push(formatOrder({ ...item, baseAsset, quoteAsset }, tickerInfo));
        }
        return orders;
    }

    public async createOrderLimit(side: OrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder> {
        await this.respectApiRatioLimits();
        throw new Error('Method not implemented.');
    }

    public async getAssetBalance(asset: string): Promise<IBalance> {
        await this.respectApiRatioLimits();
        throw new Error('Method not implemented.');
    }

    listenUserEvents(): void {
        throw new Error('Method not implemented.');
    }

    ////////////////////////////////////////////////// PRIVATE METHODS ///////////

    public async getApiRatioLimits(): Promise<any> {
        // console.log('API Ratio', this.client);
        // throw new Error('Method not implemented.');
    }

    /**
     * Build requests to fetch orders.
     * That fucking kucoin API is limited to 7 days... So we have to loop every 7 days to get 1 year history.
     *
     * @private
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The base asset.
     * @param {'done' | 'active'} status - The order status filter (default: 'done').
     * @param {'TRADE' | 'MARGIN_TRADE'} tradeType - The order trade type (default: 'TRADE').
     * @param {number} daysRange - The number of days to request (default: 365).
     * @returns {IOrder[]} - The orders list.
     */
    private async __getAllOrders(
        baseAsset: string,
        quoteAsset: string,
        status: 'done' | 'active' = 'done',
        tradeType: 'TRADE' | 'MARGIN_TRADE' = 'TRADE',
        daysRange: number = 365,
    ): Promise<IOrder[]> {
        await this.respectApiRatioLimits();

        // Get symbols infos
        const tickerInfo = await this.getTickerInfo(baseAsset, quoteAsset);

        // Params
        const symbol = this.formatSymbol(baseAsset, quoteAsset);

        // Init loop
        const daysLimit = 7;
        const dailyMs = 86400 * 1000;
        let startAt = Date.now() - dailyMs * daysLimit;
        let endAt = Date.now();

        // Define range
        const finalDate = startAt - dailyMs * daysRange;

        // Init concurrency
        const limit = pLimit(10);
        const input = [];

        // Prepare orders
        while (endAt > finalDate) {
            input.push(limit(() => this.__getAllOrdersRequest({ tradeType, symbol, status, endAt, startAt, baseAsset, quoteAsset, tickerInfo })));
            startAt -= dailyMs * daysLimit;
            endAt -= dailyMs * daysLimit;
        }

        // Request all orders
        const results = await Promise.all(input);

        // Returns formated orders
        return [].concat(...results);
    }

    /**
     * Function called with concurrency requests.
     *
     * @param {*} obj - The metas used to request
     * @returns {Promise<IOrder[]>} - The list of orders
     */
    private async __getAllOrdersRequest(obj: any): Promise<IOrder[]> {
        const orders: IOrder[] = [];
        const { tradeType, symbol, status, endAt, startAt, baseAsset, quoteAsset, tickerInfo } = obj;
        const req = await this.client.rest.Trade.Orders.getOrdersList(tradeType, {
            symbol,
            status,
            endAt,
            startAt,
        });
        if (req?.data?.items) {
            req.data.items.forEach((item: any) => {
                orders.push(formatOrder({ ...item, baseAsset, quoteAsset }, tickerInfo));
            });
        }
        return orders;
    }
}
