const ClientKucoin = require('kucoin-node-sdk');

import pLimit from 'p-limit';
import { IBalance, ICandle, IOrder, IProvider, TOrderSide } from '../../common/interfaces';
import { CandleChartInterval } from '../interfaces/CandleChartInterval';
import { createLogger, Logger } from '../../../utils/logger/logger';
import { IProviderKucoin } from '../interfaces/IProviderKucoin';
import { formatTickerInfo } from './utils/formatTickerInfo';
import { formatBalances } from './utils/formatBalances';
import { formatOrder } from './utils/formatOrder';
import { ErrorInvalidSymbol } from '../../../utils/errors/ErrorInvalidSymbol';
import { formatCandle, KucoinKline } from './utils/formatCandle';
import { nz, roundToFloor } from '../../../utils/numbers/numbers';
import { ProviderCommon } from '../../common/lib';
import { timeout } from '../../../utils/timeout/timeout';
import { IStreamTicker } from '../../common/interfaces/IStreamTicker';
import { IOrderMarketProps, OrderStatus } from '../../common/interfaces/IOrder';
import { IAsset, ICandleChartIntervalKeys, ICandleChartIntervalInSeconds } from 'caeb-types';

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
    public weightLimitPerMinute: number = 180;

    /**
     * Define API Ratio limit levels behaviors : will pause request if weight API ratio is too high, to avoid IP ban.
     *
     * @type {{ type: string; ratio: number; waitTimeMS: number }[]}
     * @memberof ProviderCommon
     */
    public weightLimitLevels: { type: string; ratio: number; waitTimeMS: number }[] = [
        { type: 'EMERGENCY', ratio: 0.8, waitTimeMS: 30000 },
        { type: 'WARNING', ratio: 0.75, waitTimeMS: 10000 },
        { type: 'CAUTION', ratio: 0.5, waitTimeMS: 5000 },
    ];

    /**
     * The client for RESTFUL and WebSocket API.
     *
     * @type {Binance}
     * @memberof ProviderKucoin
     */
    public client: any = ClientKucoin;

    /**
     * The websocket datafeed.
     */
    private datafeed: any;

    /**
     * Store streamKeys and avoid duplicate emit.
     *
     * @memberof ProviderKucoin
     */
    private streamKeyDuplicate: { [key: string]: number } = {};

    /**
     * The logger.
     *
     * @type {Logger}
     * @memberof ProviderKucoin
     */
    public log: Logger;

    // Cache symbols
    private cacheSymbols: IAsset[];
    private cacheSymbolsLast: number;
    private cacheSymbolsTTL: number = 60 * 60 * 1000;

    // Weight per limit history
    private _weightLimitPerMinuteCalls: number[] = [];

    /**
     * Max number of candles for one history request.
     */
    private historyLimitMax = 1500;

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

    public async getApiRatioLimits(): Promise<any> {
        // this.log.debug('API Ratio', { items: this._weightLimitPerMinuteCalls, length: this._weightLimitPerMinuteCalls.length, max: this.weightLimitPerMinute });

        // Wait for limits (and if over, wait 5s)
        this._weightLimitPerMinuteCalls = this._weightLimitPerMinuteCalls.filter(at => Date.now() - at < 60000);

        // Expose limits
        const limits = {
            spot: {
                usedWeight1m: this._weightLimitPerMinuteCalls.length,
            },
        };
        return limits;
    }

    public async respectApiRatioLimits(): Promise<void> {
        // Add Api call to history
        this._weightLimitPerMinuteCalls.push(Date.now());

        // Call super
        return super.respectApiRatioLimits();
    }

    /**
     * Add penality to API Ratio limit
     */
    private _onApiRatioLimitsErrorCode() {
        for (let i = 0; i < this.weightLimitLevels[2].ratio * this.weightLimitPerMinute; i++) {
            this._weightLimitPerMinuteCalls.push(Date.now());
        }
    }

    /**
     * Get exchange infos for all tickers.
     *
     * @private
     * @returns {Promise<IAsset[]>} - The list of all symbols.
     * @memberof ProviderKucoin
     */
    public async getExchangeInfo(): Promise<IAsset[]> {
        if (this.cacheSymbols && this.cacheSymbols.length && Date.now() - this.cacheSymbolsLast < this.cacheSymbolsTTL) {
            return this.cacheSymbols;
        }
        await this.respectApiRatioLimits();
        const { data: symbols } = await this.client.rest.Market.Symbols.getSymbolsList();
        this.cacheSymbols = symbols.map((symbol: any) => formatTickerInfo(symbol));
        this.cacheSymbolsLast = Date.now();
        return this.cacheSymbols;
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
        opts: {
            limit?: number;
            startDate?: Date;
            endDate?: Date;
        } = { limit: this.historyLimitMax },
    ): Promise<ICandle[]> {
        // Init candles to returns
        const candleResults: ICandle[] = [];

        // Init symbol and interval type
        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const interval = CandleChartInterval[intervalType];

        // Defaults limit
        const limit = Math.min(nz(opts.limit, this.historyLimitMax), this.historyLimitMax);

        // Calculate limits
        const intervalMs = ICandleChartIntervalInSeconds[intervalType] * 1000;
        const startAt = Math.floor(opts.startDate?.valueOf() / 1000) ?? roundToFloor((Date.now() - intervalMs * limit) / 1000, 0);
        const endAt = Math.floor(opts.endDate?.valueOf() / 1000) ?? roundToFloor(Date.now() / 1000, 0);

        // Build requests to respect API limitations
        const numCandles = (endAt - startAt) / ICandleChartIntervalInSeconds[intervalType];
        const numRequest = Math.ceil(numCandles / this.historyLimitMax);
        this.log.debug('getHistory', { symbol, interval, startAt, endAt, numCandles, numRequest });

        // Fetch each group of klines
        for (let _startAt = startAt; _startAt < endAt; _startAt += ICandleChartIntervalInSeconds[intervalType] * this.historyLimitMax) {
            await this.respectApiRatioLimits();

            const _endAt = _startAt + ICandleChartIntervalInSeconds[intervalType] * (this.historyLimitMax - 1);

            this.log.debug('Fetch candles :', { symbol, startAt: _startAt, endAt: _endAt, limit: this.historyLimitMax });
            const { data: candles } = await this.client.rest.Market.Histories.getMarketCandles(symbol, interval, {
                startAt: _startAt,
                endAt: _endAt,
                limit: this.historyLimitMax,
            });
            // this.log.debug('first', { candle: candles && candles[0] ? new Date(parseInt(candles[0][0]) * 1000, 10) : [] });

            candleResults.push.apply(
                candleResults,
                candles?.map((candle: KucoinKline) => formatCandle(candle, intervalMs)),
            );
        }

        // Format to abstract ICandle[]
        return candleResults.sort((a, b) => (a.openTime > b.openTime ? 1 : -1));
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
     * Get asset balance.
     *
     * @returns {Promise<IBalance>} - Asset balance.
     */
    public async getAssetBalance(asset: string): Promise<IBalance> {
        const balances = await this.getAccountBalances();
        return balances.find(a => a.asset === asset);
    }

    /**
     * Get an order with its ID.
     *
     * @param {string} orderId
     * @returns {Promise<IOrder>}
     *
     * @memberOf ProviderKucoin
     */
    public async getOrderById(orderId: string): Promise<IOrder> {
        await this.respectApiRatioLimits();

        const req = await this.client.rest.Trade.Orders.getOrderByID(orderId);
        const order = req?.data;
        const [baseAsset, quoteAsset] = order?.symbol.split('-');
        const tickerInfo = await this.getTickerInfo(baseAsset, quoteAsset);

        return formatOrder({ ...order, baseAsset, quoteAsset }, tickerInfo);
    }

    /**
     * Grouping order request for an array of pairs.
     *
     * @param {{ baseAsset: string; quoteAsset: string }[]} pairs - Pairs of asssets to filter.
     * @param {'done' | 'active'} status - The orders status.
     * @param {number} daysRange - The number of days to request (default: 365).
     * @returns {IOrder[]} - The list of orders.
     */
    public async getAllOrdersForPairs(pairs?: { baseAsset: string; quoteAsset: string }[], status?: 'done' | 'active', daysRange?: number): Promise<IOrder[]> {
        const orders = await this.__getAllOrders(undefined, undefined, status, 'TRADE', daysRange);

        // If pairs must be filtered, get unique symbols list and compare with orders
        if (pairs && pairs.length) {
            const symbols = [...new Set(pairs.map(p => this.formatSymbol(p.baseAsset, p.quoteAsset)))];
            return orders.filter(o => symbols.includes(this.formatSymbol(o.baseAsset, o.quoteAsset)));
        }

        // Else returns all list
        return orders;
    }

    /**
     * Get All 'done' orders for a symbol.
     *
     * @param {string} baseAsset - The base asset.
     * @param {string} quoteAsset - The quote asset.
     * @param {number} daysRange - The number of days to request (default: 365).
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
     * @param {number} daysRange - The number of days to request (default: 365).
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

    public async createOrderLimit(side: TOrderSide, quantity: number, price: number, baseAsset: string, quoteAsset: string): Promise<IOrder> {
        await this.respectApiRatioLimits();
        throw new Error('Method not implemented.');
    }

    public async createOrderMarket(props: IOrderMarketProps): Promise<IOrder> {
        await this.respectApiRatioLimits();

        const { baseAsset, quoteAsset, side, quantity, clientOrderId } = props;

        const symbol = this.formatSymbol(baseAsset, quoteAsset);
        const tickerInfo = await this.getTickerInfo(baseAsset, quoteAsset);

        const order = {
            symbol,
            side,
            type: 'market',
            size: quantity,
            clientOid: clientOrderId,
        };

        // {"side":"BUY","quantity":0.0080511,"baseAsset":"ETH","quoteAsset":"USDT","orderId":"caeb-BUY-1656276623229"}
        // {"symbol":"ETH-USDT","side":"BUY","type":"market","size":0.0080511,"clientOid":"caeb-BUY-1656276623229"}

        this.log.debug('createOrderMarket', { props, order, tickerInfo });

        const { code, success, data } = await this.client.rest.Trade.Orders.postOrder(order);

        this.log.debug('createOrderMarket::response', { code, success, data });

        if (!data?.orderId) {
            throw new Error(`Error while creating order : ${JSON.stringify({ code, data })}`);
        }

        return await this.getOrderById(data.orderId);
    }

    /**
     * Open a private websocket events listener.
     *
     * @memberOf ProviderKucoin
     */
    public async attachStreamAccount() {
        this.datafeed = new this.client.websocket.Datafeed(true);

        // Catch close event
        this.datafeed.onClose(() => {
            this.log.debug('Datafeed close');
        });

        // connect to the datafeed
        this.datafeed.connectSocket();

        // Subsribe to events
        this._attachStreamPrivateAccount('/account/balance');
        this._attachStreamPrivateOrder('/spotMarket/tradeOrders');
        this._attachStreamPrivateOrder('/spotMarket/advancedOrders');
        // this.datafeed.subscribe('/account/balance', this._onAccountStreamMessage.bind(this));
        // this.datafeed.subscribe('/spotMarket/tradeOrders', this._onAccountStreamMessage.bind(this));
        // this.datafeed.subscribe('/spotMarket/advancedOrders', this._onAccountStreamMessage.bind(this));
        // this.datafeed.subscribe('/market/candles:BTC-USDT_1min', this._onAccountStreamMessage.bind(this));

        // Debug
        // console.log('topicListener', this.datafeed.topicListener);
    }

    public async attachStreamTicker(baseAsset: string, quoteAsset: string) {
        const ticker = `${baseAsset}-${quoteAsset}`;
        return this.datafeed.subscribe(`/market/candles:${ticker}_1min`, this._onTickerStreamMessage.bind(this));
    }

    ////////////////////////////////////////////////// PRIVATE METHODS ///////////

    private _attachStreamPrivateAccount(topic: string): string {
        // this.log.trace('_attachStreamTopic', topic);
        return this.datafeed.subscribe(topic, this._onAccountStreamMessage.bind(this), true);
    }

    private _attachStreamPrivateOrder(topic: string): string {
        // this.log.trace('_attachStreamPrivateOrder', topic);
        return this.datafeed.subscribe(topic, this._onAccountStreamOrder.bind(this), true);
    }

    private _onAccountStreamMessage(message: any) {
        this.log.trace('Stream::balance', message);
        this.emit('stream:balance', {
            provider: this.id,
            message,
        });
    }

    /**
     * Format websocket received order and emit an event.
     *
     * @param message
     */
    private _onAccountStreamOrder(message: any) {
        this.log.trace('Stream::order', message);

        const data = message.data;
        const [baseAsset, quoteAsset] = data?.symbol.split('-');

        // Prepare order
        const order: Partial<IOrder> = {
            baseAsset,
            quoteAsset,
            orderId: data?.orderId,
            clientOrderId: data?.clientOid,
            side: data?.side?.toUpperCase(),
            type: data?.orderType?.toUpperCase(),
            origQty: nz(parseFloat(data?.size), 0) ?? nz(parseFloat(data?.filledSize), 0),
            executedQty: nz(parseFloat(data?.filledSize), 0),
            createdAt: new Date(parseInt(data?.orderTime, 10) / 1000000),
            updatedAt: new Date(parseInt(data?.ts, 10) / 1000000),
        };

        // Calculate order price
        if (data?.matchPrice) {
            order.price = Math.max(0, nz(parseFloat(data?.matchPrice), 0));
        }
        if (data?.price) {
            order.price = Math.max(0, nz(parseFloat(data?.price), 0));
        }

        // Calculate cumulative quote quantity if price is ok
        if (order.price > 0) {
            order.origQuoteOrderQty = nz(order.price * order.origQty, 0);
            order.cummulativeQuoteQty = nz(order.price * order.executedQty, 0);
        }

        // Set order status depending on event.type (https://docs.kucoin.com/#private-order-change-events)
        switch (data?.type) {
            case 'open':
                order.status = OrderStatus.NEW;
                break;

            case 'canceled':
                order.status = OrderStatus.CANCELED;
                break;

            case 'match':
            case 'update':
                order.status = OrderStatus.PARTIALLY_FILLED;
                break;

            case 'filled':
                order.status = OrderStatus.FILLED;
                break;
        }

        // Override status if 'status' is explicitely done
        if (data?.status === 'done') {
            order.status = OrderStatus.FILLED;
        }

        // Emit the order
        this.emit('stream:order', {
            provider: this.id,
            message: order,
        });
    }

    private _onTickerStreamMessage(message: any) {
        const { time, candles } = message.data;
        const topicParts = message.topic.split(':')[1].split('_');
        const [baseAsset, quoteAsset] = topicParts[0].split('-');

        const interval = ICandleChartIntervalInSeconds.ONE_MINUTE;

        // Format candle values
        const openTime = parseFloat(candles[0]) * 1000;
        const isNew = message.subject.includes('.update') ? false : true;

        // Avoid multiple stream emits (max 1 every second)
        const lastUpdateSeconds = Math.floor(time / 1000);
        const streamObj = 'stream:ticker';
        const streamKey = [streamObj, this.id, baseAsset, quoteAsset, interval].join('-');

        // Emit ticker if not seen since 1 second
        if (this.streamKeyDuplicate[streamKey] !== lastUpdateSeconds) {
            this.streamKeyDuplicate[streamKey] = lastUpdateSeconds;

            const ticker: IStreamTicker = {
                provider: this.id,
                baseAsset,
                quoteAsset,
                interval: interval * 1000,
                time: Math.floor(time / 1000 / 1000),
                new: isNew,
                candle: {
                    t: openTime,
                    o: parseFloat(candles[1]),
                    c: parseFloat(candles[2]),
                    h: parseFloat(candles[3]),
                    l: parseFloat(candles[4]),
                    v: parseFloat(candles[5]),
                },
            };

            this.emit(streamObj, ticker);
        }
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
        baseAsset?: string,
        quoteAsset?: string,
        status?: 'done' | 'active',
        tradeType: 'TRADE' | 'MARGIN_TRADE' = 'TRADE',
        daysRange: number = 365,
    ): Promise<IOrder[]> {
        // If symbol is defined
        const symbol = baseAsset && quoteAsset ? this.formatSymbol(baseAsset, quoteAsset) : undefined;

        // // Request the first page
        // const currentPage = 1;
        // const pageSize = 500;
        // const { orders } = await this.__getAllOrdersPerPage({ tradeType, symbol, status, baseAsset, quoteAsset, tickerInfo }, currentPage, pageSize);

        // // Returns formated orders
        // return orders;

        // Init loop
        const daysLimit = 7;
        const dailyMs = 86400 * 1000;
        let startAt = Date.now() - dailyMs * daysLimit;
        let endAt = Date.now();

        // Define range
        const finalDate = startAt - dailyMs * daysRange;

        // Init concurrency
        const limit = pLimit(1);
        const input = [];

        // Prepare orders
        while (endAt > finalDate) {
            input.push(limit(() => this.__getAllOrdersRequest({ tradeType, symbol, status, endAt, startAt, baseAsset, quoteAsset })));
            // input.push(limit(() => this.__getAllHistoricalOrders({ tradeType, symbol, status, endAt, startAt, baseAsset, quoteAsset })));
            input.push(limit(() => timeout(334)));
            startAt -= dailyMs * daysLimit;
            endAt -= dailyMs * daysLimit;
        }

        // Request all orders
        const results = await Promise.all(input);

        // Returns formated orders
        return [].concat(...results).filter(o => o);
    }

    /**
     * Request all orders for a period.
     *
     * @param {*} obj - The metas used to request
     * @returns {Promise<IOrder[]>} - The list of orders
     */
    private async __getAllOrdersRequest(obj: any): Promise<IOrder[]> {
        await this.respectApiRatioLimits();
        const orders: IOrder[] = [];
        const { tradeType, symbol, status, endAt, startAt } = obj;
        const req = await this.client.rest.Trade.Orders.getOrdersList(tradeType, {
            symbol,
            status,
            endAt,
            startAt,
        });

        // Problem with the request ?
        if (!req.data) {
            this.log.warn('No data:', { req, code: req.code });
            if (req.code === '429000') {
                this._onApiRatioLimitsErrorCode();
                return this.__getAllOrdersRequest(obj);
            }
            return orders;
        }

        // Parse orders
        const { totalNum, totalPage, items, ...other } = req?.data;
        if (items && items.length) {
            for (const item of items) {
                const [baseAsset, quoteAsset] = item.symbol.split('-');
                const tickerInfo = await this.getTickerInfo(baseAsset, quoteAsset);
                orders.push(formatOrder({ ...item, baseAsset, quoteAsset }, tickerInfo));
            }
        }
        // console.log(totalNum, totalPage, items.length);
        return orders;
    }

    private async __getAllHistoricalOrders(obj: any): Promise<IOrder[]> {
        await this.respectApiRatioLimits();
        const orders: IOrder[] = [];
        const { symbol, status, endAt, startAt, currentPage, pageSize } = obj;

        const req = await this.client.rest.Trade.Orders.getV1HistoricalOrdersList({
            symbol,
            status,
            endAt,
            startAt,
            currentPage,
            pageSize,
        });

        // console.log('Historical orders :', req);

        const { totalNum, totalPage, items, ...other } = req?.data;
        if (items && items.length) {
            for (const item of items) {
                const [baseAsset, quoteAsset] = item.symbol.split('-');
                const tickerInfo = await this.getTickerInfo(baseAsset, quoteAsset);
                orders.push(formatOrder({ ...item, baseAsset, quoteAsset }, tickerInfo));
            }
        }
        // console.log('Historical orders :', totalNum, totalPage, items.length);
        return orders;
    }

    /**
     * Get orders with paginated results.
     *
     * @param {*} obj - The metas used to request.
     * @param {number} currentPage - The currentPage to request (start at 1).
     * @param {number} pageSize - The count of orders by page.
     * @returns {Promise<{ orders: IOrder[]; currentPage: number; pageSize: number; totalNum: number; totalPage: number }>} - The list of orders and pagination states.
     */
    public async __getAllOrdersPerPage(
        obj: any,
        currentPage: number = 1,
        pageSize: number = 500,
    ): Promise<{ orders: IOrder[]; currentPage: number; pageSize: number; totalNum: number; totalPage: number }> {
        await this.respectApiRatioLimits();
        const orders: IOrder[] = [];
        const { tradeType, symbol, status, baseAsset, quoteAsset, endAt, startAt, tickerInfo } = obj;
        const req = await this.client.rest.Trade.Orders.getOrdersList(tradeType, {
            symbol,
            status,
            currentPage,
            pageSize,
            endAt,
            startAt,
        });

        const { totalNum, totalPage, items, ...other } = req?.data;
        if (items) {
            items.forEach((item: any) => {
                orders.push(formatOrder({ ...item, baseAsset, quoteAsset }, tickerInfo));
            });
        }

        return { orders, currentPage, pageSize, totalNum, totalPage };
    }
}
