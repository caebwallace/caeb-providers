import ClientBinance, { Binance, CancelOrderResult, CandleChartInterval, OrderSide, OrderType, ReconnectingWebSocketHandler } from 'binance-api-node';
import { IProviderBinance } from '../interfaces/IProviderBinance';
import { formatBalances, formatCanceledOrder, formatCandle, formatNewOrder, formatQueryOrder, formatTickerInfo, formatWsOrder } from './utils';
import { ErrorInvalidSymbol } from '../../../utils/errors';
import { roundToCeil } from '../../../utils/numbers/numbers';
import { createLogger, Logger } from '../../../utils/logger/logger';
import { IBalance, ICandle, IOrder, IProvider, TProviderTransferInnerType } from '../../common/interfaces';
import { ProviderCommon } from '../../common/lib';
import { IOrderMarketProps } from '../../common/interfaces/IOrder';
import { IAsset, ICandleChartIntervalKeys } from 'caeb-types';

// Provider for Binance
export class ProviderBinance extends ProviderCommon implements IProvider {
    /**
     * The name of the provider.
     *
     * @type {string}
     * @memberof ProviderBinance
     */
    public name: string = 'binance';

    /**
     * The id of the provider (readonly).
     *
     * @type {string}
     * @memberof ProviderBinance
     */
    public readonly id: string = 'binance';

    /**
     * The API url.
     *
     * @type {string}
     * @memberof ProviderBinance
     */
    public httpBase: string = 'https://api.binance.com';

    /**
     * The testnet API url.
     *
     * @type {string}
     * @memberof ProviderBinance
     */
    public readonly httpBaseTestnet: string = 'https://testnet.binance.vision';

    /**
     * Use testnet.
     *
     * @type {string}
     * @memberof ProviderBinance
     */
    public testnet: boolean = false;

    /**
     * The API key (https://www.binance.com/userCenter/createApi.html).
     *
     * @type {string}
     * @memberof ProviderBinance
     */
    public apiKey: string;

    /**
     * The API secret key.
     *
     * @type {string}
     * @memberof ProviderBinance
     */
    public apiSecret: string;

    /**
     * The client for RESTFUL and WebSocket API.
     *
     * @type {Binance}
     * @memberof ProviderBinance
     */
    public client: Binance;

    /**
     * Receive window prop (recvWindow).
     *
     * @type {Binance}
     * @memberof ProviderBinance
     */
    public recvWindow: number = 60000;

    /**
     * Define the max wheight to avoid banning.
     *
     * @type {Binance}
     * @memberof ProviderBinance
     */
    public weightLimitPerMinute: number = 1200;

    /**
     * The logger.
     *
     * @type {Logger}
     * @memberof ProviderBinance
     */
    public log: Logger;

    // Cache symbols
    private cacheSymbols: IAsset[];
    private cacheSymbolsLast: number;
    private cacheSymbolsTTL: number = 60 * 60 * 1000;

    apiPassPhrase?: string;
    subAccountId?: string | number;

    /**
     * Init the Provider with config.
     *
     * @param {IProviderBinanceConfig} props - The class properties.
     * @memberof ProviderBinance
     */
    constructor(props: IProviderBinance) {
        super();

        // Set config
        if (props && props.name) this.name = props.name;
        if (props && props.httpBase) this.httpBase = props.httpBase;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.testnet) this.testnet = props.testnet;
        if (props && props.recvWindow) this.recvWindow = props.recvWindow;

        // Configure to use testnet
        if (!props.httpBase && props.testnet) {
            this.httpBase = this.httpBaseTestnet;
        }

        // Create logger
        this.log = createLogger(this.name.toUpperCase());

        // Create client
        this.client = ClientBinance({
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            httpBase: this.httpBase,
        });
    }

    innerTransfer(clientOid: string, baseAsset: string, amount: number, transferType: keyof typeof TProviderTransferInnerType): Promise<string> {
        throw new Error('Method not implemented.');
    }

    attachStreamTicker(ticker: string): void {
        throw new Error('Method not implemented.');
    }

    //////////////////////////////////////////////// PUBLIC METHODS ///////////

    /**
     * Get exchange infos for all tickers.
     *
     * @private
     * @returns {array} - The list of all symbols.
     * @memberof ProviderBinance
     */
    public async getExchangeInfo(): Promise<IAsset[]> {
        if (this.cacheSymbols && this.cacheSymbols.length && Date.now() - this.cacheSymbolsLast < this.cacheSymbolsTTL) {
            return this.cacheSymbols;
        }
        const { symbols, rateLimits } = await this.client.exchangeInfo();
        this.cacheSymbols = symbols.map(symbol => formatTickerInfo(symbol));
        this.cacheSymbolsLast = Date.now();
        return this.cacheSymbols;
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
     * @param {ICandleChartIntervalKeys} [intervalType=ICandleChartIntervalKeys.ONE_DAY] - The type of interval.
     * @param {number} [limit=200] - The limit.
     * @returns {Promise<ICandle[]>}
     * @memberof ProviderBinance
     */
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
        const symbol = this.formatSymbol(baseAsset, quoteAsset);

        // Build interval (dummy method for yet, should be smarter, but not have time yet)
        let intervalResolution: CandleChartInterval;
        switch (intervalType) {
            case 'ONE_MINUTE':
                intervalResolution = CandleChartInterval.ONE_MINUTE;
                break;
            case 'THREE_MINUTES':
                intervalResolution = CandleChartInterval.THREE_MINUTES;
                break;
            case 'FIVE_MINUTES':
                intervalResolution = CandleChartInterval.FIVE_MINUTES;
                break;
            case 'FIFTEEN_MINUTES':
                intervalResolution = CandleChartInterval.FIFTEEN_MINUTES;
                break;
            case 'THIRTY_MINUTES':
                intervalResolution = CandleChartInterval.THIRTY_MINUTES;
                break;
            case 'ONE_HOUR':
                intervalResolution = CandleChartInterval.ONE_HOUR;
                break;
            case 'TWO_HOURS':
                intervalResolution = CandleChartInterval.TWO_HOURS;
                break;
            case 'FOUR_HOURS':
                intervalResolution = CandleChartInterval.FOUR_HOURS;
                break;
            case 'SIX_HOURS':
                intervalResolution = CandleChartInterval.SIX_HOURS;
                break;
            case 'EIGHT_HOURS':
                intervalResolution = CandleChartInterval.EIGHT_HOURS;
                break;
            case 'TWELVE_HOURS':
                intervalResolution = CandleChartInterval.TWELVE_HOURS;
                break;
            case 'ONE_DAY':
                intervalResolution = CandleChartInterval.ONE_DAY;
                break;
            case 'ONE_WEEK':
                intervalResolution = CandleChartInterval.ONE_WEEK;
                break;
        }

        const candles = await this.client.candles({ symbol, interval: intervalResolution, limit: opts.limit });
        return candles.map(candle => formatCandle(candle));
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
        const price = await this.client.prices({ symbol });
        return parseFloat(price[symbol]);
    }

    /**
     * Build the symbol pair name from base and quote assets.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {string} - The symbol pair name.
     * @memberof ProviderBinance
     */
    public formatSymbol(baseAsset: string, quoteAsset: string): string {
        return `${baseAsset}${quoteAsset}`;
    }

    ////////////////////////////////////////////////// USER METHODS ///////////

    /**
     * Get account balances.
     *
     * @returns {Promise<IBalance[]>} - Array of balances.
     * @memberof ProviderBinance
     */
    public async getAccountBalances(): Promise<IBalance[]> {
        await this.respectApiRatioLimits();
        const { balances } = await this.client.accountInfo({ useServerTime: true });
        return formatBalances(balances);
    }

    public async getTradingBalances(): Promise<IBalance[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * Get the balance of an asset.
     *
     * @param {string} asset - The asset to request.
     * @returns {Promise<IBalance>} - The quote asset balance.
     * @memberof ProviderBinance
     */
    public async getAssetBalance(asset: string): Promise<IBalance> {
        const balances = await this.getAccountBalances();
        return balances.find(a => a.asset === asset);
    }

    /**
     * Grouping order request for an array of pairs.
     *
     * @param {{ baseAsset: string; quoteAsset: string }[]} pairs - Pairs of asssets to filter.
     * @param {'done' | 'active'} status - The orders status.
     * @param {number} daysRange - The number of days to request (default: 365).
     * @returns {IOrder[]} - The list of orders.
     */
    public async getAllOrdersForPairs(pairs: { baseAsset: string; quoteAsset: string }[], status?: string, daysRange?: number): Promise<IOrder[]> {
        throw new Error('Method not implemented.');
    }

    /**
     * Get all orders (filled or active).
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @param {string} orderId - If set, it will get orders >= that orderId. Otherwise most recent orders are returned.
     * @returns {Promise<IOrder[]>} - All orders list.
     * @memberof ProviderBinance
     */
    public async getAllOrders(baseAsset: string, quoteAsset: string, orderId?: number): Promise<IOrder[]> {
        await this.respectApiRatioLimits();
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const props: { symbol: string; orderId?: number | undefined; recvWindow?: number | undefined } = { symbol };
        if (orderId) props.orderId = orderId;
        if (this.recvWindow) props.recvWindow = this.recvWindow;
        const orders = await this.client.allOrders(props);
        return orders.map(order => formatQueryOrder(order, baseAsset, quoteAsset));
    }

    /**
     * Get active orders only.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {Promise<IOrder[]>} - All orders list.
     * @memberof ProviderBinance
     */
    public async getActiveOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[]> {
        await this.respectApiRatioLimits();
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const orders = await this.client.openOrders({ symbol });
        return orders.map(order => formatQueryOrder(order, baseAsset, quoteAsset));
    }

    /**
     * Create a LIMIT order.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @param {OrderSide} side - Side of the order (BUY | SELL)
     * @param {number} quantity - The amount of the token concerned.
     * @param {number} price - The price of the limit order.
     * @returns {Promise<IOrder>} - The created order.
     * @memberof ProviderBinance
     */
    public async createOrderLimit(side: OrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder> {
        await this.respectApiRatioLimits();
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        // this.log.debug(`SET ORDER LIMIT [${side}] : ${quantity} ${price}`);
        const order = formatNewOrder(
            await this.client.order({
                symbol,
                side,
                type: 'LIMIT' as OrderType.MARKET,
                quantity: quantity.toString(),
                price: price.toString(),
            }),
            baseAsset,
            quoteAsset,
        );
        // this.log.debug(`Create Order: ${JSON.stringify(order)}`);
        return order;
    }

    public async createOrderMarket(props: IOrderMarketProps): Promise<IOrder> {
        await this.respectApiRatioLimits();
        throw new Error('Method not implemented.');
    }

    /**
     * Cancel Open Orders.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @returns {Promise<IOrder[]>} - The closed orders.
     * @memberof ProviderBinance
     */
    public async cancelOpenOrders(baseAsset: string, quoteAsset: string): Promise<IOrder[] | boolean> {
        await this.respectApiRatioLimits();
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        this.log.debug('Cancel all Open Orders...');
        try {
            const orders = await this.client.cancelOpenOrders({ symbol });
            return orders.map((order: CancelOrderResult) => formatCanceledOrder(order));
        } catch (err) {
            this.log.error(`Not able to close OpenOrders : [${err.code}] ${err.message}`);
            return [];
        }
    }

    /**
     * Attach websocket account events to emit updates.
     *
     * @returns {Promise<ReconnectingWebSocketHandler>} - The websocket instance
     */
    public async attachStreamAccount(): Promise<ReconnectingWebSocketHandler> {
        const ws = await this.client.ws.user(async msg => {
            if (msg.eventType && msg.eventType === 'executionReport') {
                const symbols = await this.getExchangeInfo();
                const { baseAsset, quoteAsset } = symbols.find(s => this.formatSymbol(s.baseAsset, s.quoteAsset) === msg.symbol);
                this.emit('order', formatWsOrder(msg, baseAsset, quoteAsset));
            } else {
                this.log.trace(msg);
            }
        });
        return ws;
    }

    /**
     * Returns API ratio limits.
     *
     * @private
     * @returns {Promise<any>} - The API limits.
     */
    public async getApiRatioLimits(): Promise<any> {
        const info = await this.client.getInfo();
        const limits = {
            spot: {
                usedWeight1m: roundToCeil(info?.spot.usedWeight1m, 0),
                orderCount10s: roundToCeil(info?.spot.orderCount10s, 0),
                orderCount1m: roundToCeil(info?.spot.orderCount1m, 0),
                orderCount1h: roundToCeil(info?.spot.orderCount1h, 0),
                orderCount1d: roundToCeil(info?.spot.orderCount1d, 0),
            },
            futures: {
                usedWeight1m: roundToCeil(info?.futures.usedWeight1m, 0),
                orderCount10s: roundToCeil(info?.futures.orderCount10s, 0),
                orderCount1m: roundToCeil(info?.futures.orderCount1m, 0),
                orderCount1h: roundToCeil(info?.futures.orderCount1h, 0),
                orderCount1d: roundToCeil(info?.futures.orderCount1d, 0),
            },
        };
        return limits;
    }

    public async wsPing(): Promise<boolean> {
        return await this.client.futuresPing();
    }
}

// Export type
export { Binance };
