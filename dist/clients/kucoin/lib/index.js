'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __rest =
    (this && this.__rest) ||
    function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
            }
        return t;
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProviderKucoin = void 0;
const ClientKucoin = require('kucoin-node-sdk');
const p_limit_1 = __importDefault(require('p-limit'));
const CandleChartInterval_1 = require('../interfaces/CandleChartInterval');
const logger_1 = require('../../../utils/logger/logger');
const formatTickerInfo_1 = require('./utils/formatTickerInfo');
const formatBalances_1 = require('./utils/formatBalances');
const formatOrder_1 = require('./utils/formatOrder');
const ErrorInvalidSymbol_1 = require('../../../utils/errors/ErrorInvalidSymbol');
const formatCandle_1 = require('./utils/formatCandle');
const numbers_1 = require('../../../utils/numbers/numbers');
const lib_1 = require('../../common/lib');
const timeout_1 = require('../../../utils/timeout/timeout');
const IOrder_1 = require('../../common/interfaces/IOrder');
const caeb_types_1 = require('caeb-types');
class ProviderKucoin extends lib_1.ProviderCommon {
    constructor(props) {
        super();
        this.name = 'kucoin';
        this.id = 'kucoin';
        this.httpBase = 'https://openapi-v2.kucoin.com';
        this.httpBaseTestnet = 'https://openapi-sandbox.kucoin.com';
        this.testnet = false;
        this.weightLimitPerMinute = 180;
        this.weightLimitLevels = [
            { type: 'EMERGENCY', ratio: 0.8, waitTimeMS: 30000 },
            { type: 'WARNING', ratio: 0.75, waitTimeMS: 10000 },
            { type: 'CAUTION', ratio: 0.5, waitTimeMS: 5000 },
        ];
        this.client = ClientKucoin;
        this.streamKeyDuplicate = {};
        this.cacheSymbolsTTL = 60 * 60 * 1000;
        this._weightLimitPerMinuteCalls = [];
        this.historyLimitMax = 1500;
        if (props && props.name) this.name = props.name;
        if (props && props.httpBase) this.httpBase = props.httpBase;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.apiPassPhrase) this.apiPassPhrase = props.apiPassPhrase;
        if (props && props.testnet) this.testnet = props.testnet;
        if (!props.httpBase && props.testnet) {
            this.httpBase = this.httpBaseTestnet;
        }
        this.log = (0, logger_1.createLogger)(this.name.toUpperCase());
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
    getApiRatioLimits() {
        return __awaiter(this, void 0, void 0, function* () {
            this._weightLimitPerMinuteCalls = this._weightLimitPerMinuteCalls.filter(at => Date.now() - at < 60000);
            const limits = {
                spot: {
                    usedWeight1m: this._weightLimitPerMinuteCalls.length,
                },
            };
            return limits;
        });
    }
    respectApiRatioLimits() {
        const _super = Object.create(null, {
            respectApiRatioLimits: { get: () => super.respectApiRatioLimits },
        });
        return __awaiter(this, void 0, void 0, function* () {
            this._weightLimitPerMinuteCalls.push(Date.now());
            return _super.respectApiRatioLimits.call(this);
        });
    }
    _onApiRatioLimitsErrorCode() {
        for (let i = 0; i < this.weightLimitLevels[2].ratio * this.weightLimitPerMinute; i++) {
            this._weightLimitPerMinuteCalls.push(Date.now());
        }
    }
    getExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cacheSymbols && this.cacheSymbols.length && Date.now() - this.cacheSymbolsLast < this.cacheSymbolsTTL) {
                return this.cacheSymbols;
            }
            yield this.respectApiRatioLimits();
            const { data: symbols } = yield this.client.rest.Market.Symbols.getSymbolsList();
            this.cacheSymbols = symbols.map(symbol => (0, formatTickerInfo_1.formatTickerInfo)(symbol));
            this.cacheSymbolsLast = Date.now();
            return this.cacheSymbols;
        });
    }
    getPrice(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const { data: ticker } = yield this.client.rest.Market.Symbols.getTicker(symbol);
            const price = parseFloat(ticker.price);
            return price;
        });
    }
    getTickerInfo(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbols = yield this.getExchangeInfo();
            const asset = symbols.find(s => s.baseAsset === baseAsset && s.quoteAsset === quoteAsset);
            if (!asset) throw new ErrorInvalidSymbol_1.ErrorInvalidSymbol(`${baseAsset} / ${quoteAsset}`);
            return asset;
        });
    }
    getHistory(baseAsset, quoteAsset, intervalType = caeb_types_1.ICandleChartIntervalKeys.ONE_DAY, opts = { limit: this.historyLimitMax }) {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            const candleResults = [];
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            let intervalResolution;
            switch (intervalType) {
                case 'ONE_MINUTE':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.ONE_MINUTE;
                    break;
                case 'THREE_MINUTES':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.THREE_MINUTES;
                    break;
                case 'FIVE_MINUTES':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.FIVE_MINUTES;
                    break;
                case 'FIFTEEN_MINUTES':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.FIFTEEN_MINUTES;
                    break;
                case 'THIRTY_MINUTES':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.THIRTY_MINUTES;
                    break;
                case 'ONE_HOUR':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.ONE_HOUR;
                    break;
                case 'TWO_HOURS':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.TWO_HOURS;
                    break;
                case 'FOUR_HOURS':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.FOUR_HOURS;
                    break;
                case 'SIX_HOURS':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.SIX_HOURS;
                    break;
                case 'EIGHT_HOURS':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.EIGHT_HOURS;
                    break;
                case 'TWELVE_HOURS':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.TWELVE_HOURS;
                    break;
                case 'ONE_DAY':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.ONE_DAY;
                    break;
                case 'ONE_WEEK':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.ONE_WEEK;
                    break;
            }
            const limit = Math.min((0, numbers_1.nz)(opts.limit, this.historyLimitMax), this.historyLimitMax);
            const intervalMs = caeb_types_1.ICandleChartIntervalInSeconds[intervalType] * 1000;
            const startAt =
                (_b = Math.floor(((_a = opts.startDate) === null || _a === void 0 ? void 0 : _a.valueOf()) / 1000)) !== null && _b !== void 0
                    ? _b
                    : (0, numbers_1.roundToFloor)((Date.now() - intervalMs * limit) / 1000, 0);
            const endAt =
                (_d = Math.floor(((_c = opts.endDate) === null || _c === void 0 ? void 0 : _c.valueOf()) / 1000)) !== null && _d !== void 0
                    ? _d
                    : (0, numbers_1.roundToFloor)(Date.now() / 1000, 0);
            const numCandles = (endAt - startAt) / caeb_types_1.ICandleChartIntervalInSeconds[intervalType];
            const numRequest = Math.ceil(numCandles / this.historyLimitMax);
            this.log.debug('getHistory', { symbol, interval: intervalResolution, startAt, endAt, numCandles, numRequest });
            for (let _startAt = startAt; _startAt < endAt; _startAt += caeb_types_1.ICandleChartIntervalInSeconds[intervalType] * this.historyLimitMax) {
                yield this.respectApiRatioLimits();
                const _endAt = _startAt + caeb_types_1.ICandleChartIntervalInSeconds[intervalType] * (this.historyLimitMax - 1);
                this.log.debug('Fetch candles :', { symbol, startAt: _startAt, endAt: _endAt, limit: this.historyLimitMax });
                const { data: candles } = yield this.client.rest.Market.Histories.getMarketCandles(symbol, intervalResolution, {
                    startAt: _startAt,
                    endAt: _endAt,
                    limit: this.historyLimitMax,
                });
                candleResults.push.apply(
                    candleResults,
                    candles === null || candles === void 0 ? void 0 : candles.map(candle => (0, formatCandle_1.formatCandle)(candle, intervalMs)),
                );
            }
            return candleResults.sort((a, b) => (a.openTime > b.openTime ? 1 : -1));
        });
    }
    formatSymbol(baseAsset, quoteAsset) {
        return `${baseAsset}-${quoteAsset}`;
    }
    getAccountBalances() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const { data: balances } = yield this.client.rest.User.Account.getAccountsList();
            return (0, formatBalances_1.formatBalances)(balances || []);
        });
    }
    getAssetBalance(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.getAccountBalances();
            return balances.find(a => a.asset === asset);
        });
    }
    getOrderById(orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const req = yield this.client.rest.Trade.Orders.getOrderByID(orderId);
            const order = req === null || req === void 0 ? void 0 : req.data;
            const [baseAsset, quoteAsset] = order === null || order === void 0 ? void 0 : order.symbol.split('-');
            const tickerInfo = yield this.getTickerInfo(baseAsset, quoteAsset);
            return (0, formatOrder_1.formatOrder)(Object.assign(Object.assign({}, order), { baseAsset, quoteAsset }), tickerInfo);
        });
    }
    getAllOrdersForPairs(pairs, status, daysRange) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = yield this.__getAllOrders(undefined, undefined, status, 'TRADE', daysRange);
            if (pairs && pairs.length) {
                const symbols = [...new Set(pairs.map(p => this.formatSymbol(p.baseAsset, p.quoteAsset)))];
                return orders.filter(o => symbols.includes(this.formatSymbol(o.baseAsset, o.quoteAsset)));
            }
            return orders;
        });
    }
    getAllOrders(baseAsset, quoteAsset, daysRange) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__getAllOrders(baseAsset, quoteAsset, 'done', 'TRADE', daysRange);
        });
    }
    getActiveOrders(baseAsset, quoteAsset, daysRange) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__getAllOrders(baseAsset, quoteAsset, 'active', 'TRADE', daysRange);
        });
    }
    cancelOpenOrders(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const tickerInfo = yield this.getTickerInfo(baseAsset, quoteAsset);
            const orders = [];
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const { data } = yield this.client.rest.Trade.Orders.cancelAllOrders({ symbol });
            if (!data || !data.cancelledOrderIds) {
                return orders;
            }
            for (const orderId of data.cancelledOrderIds) {
                const { data: item } = yield this.client.rest.Trade.Orders.getOrderByID(orderId);
                orders.push((0, formatOrder_1.formatOrder)(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
            }
            return orders;
        });
    }
    createOrderLimit(side, quantity, price, baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            throw new Error('Method not implemented.');
        });
    }
    createOrderMarket(props) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const { baseAsset, quoteAsset, side, quantity, clientOrderId } = props;
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const tickerInfo = yield this.getTickerInfo(baseAsset, quoteAsset);
            const order = {
                symbol,
                side,
                type: 'market',
                size: quantity,
                clientOid: clientOrderId,
            };
            this.log.debug('createOrderMarket', { props, order, tickerInfo });
            const { code, success, data } = yield this.client.rest.Trade.Orders.postOrder(order);
            this.log.debug('createOrderMarket::response', { code, success, data });
            if (!(data === null || data === void 0 ? void 0 : data.orderId)) {
                throw new Error(`Error while creating order : ${JSON.stringify({ code, data })}`);
            }
            return yield this.getOrderById(data.orderId);
        });
    }
    attachStreamAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            this.datafeed = new this.client.websocket.Datafeed(true);
            this.datafeed.onClose(() => {
                this.log.debug('Datafeed close');
            });
            this.datafeed.connectSocket();
            this._attachStreamPrivateAccount('/account/balance');
            this._attachStreamPrivateOrder('/spotMarket/tradeOrders');
            this._attachStreamPrivateOrder('/spotMarket/advancedOrders');
        });
    }
    attachStreamTicker(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            const ticker = `${baseAsset}-${quoteAsset}`;
            return this.datafeed.subscribe(`/market/candles:${ticker}_1min`, this._onTickerStreamMessage.bind(this));
        });
    }
    _attachStreamPrivateAccount(topic) {
        return this.datafeed.subscribe(topic, this._onAccountStreamMessage.bind(this), true);
    }
    _attachStreamPrivateOrder(topic) {
        return this.datafeed.subscribe(topic, this._onAccountStreamOrder.bind(this), true);
    }
    _onAccountStreamMessage(message) {
        this.log.trace('Stream::balance', message);
        this.emit('stream:balance', {
            provider: this.id,
            message,
        });
    }
    _onAccountStreamOrder(message) {
        var _a, _b, _c;
        this.log.trace('Stream::order', message);
        const data = message.data;
        const [baseAsset, quoteAsset] = data === null || data === void 0 ? void 0 : data.symbol.split('-');
        const order = {
            baseAsset,
            quoteAsset,
            orderId: data === null || data === void 0 ? void 0 : data.orderId,
            clientOrderId: data === null || data === void 0 ? void 0 : data.clientOid,
            side: (_a = data === null || data === void 0 ? void 0 : data.side) === null || _a === void 0 ? void 0 : _a.toUpperCase(),
            type: (_b = data === null || data === void 0 ? void 0 : data.orderType) === null || _b === void 0 ? void 0 : _b.toUpperCase(),
            origQty:
                (_c = (0, numbers_1.nz)(parseFloat(data === null || data === void 0 ? void 0 : data.size), 0)) !== null && _c !== void 0
                    ? _c
                    : (0, numbers_1.nz)(parseFloat(data === null || data === void 0 ? void 0 : data.filledSize), 0),
            executedQty: (0, numbers_1.nz)(parseFloat(data === null || data === void 0 ? void 0 : data.filledSize), 0),
            createdAt: new Date(parseInt(data === null || data === void 0 ? void 0 : data.orderTime, 10) / 1000000),
            updatedAt: new Date(parseInt(data === null || data === void 0 ? void 0 : data.ts, 10) / 1000000),
        };
        if (data === null || data === void 0 ? void 0 : data.matchPrice) {
            order.price = Math.max(0, (0, numbers_1.nz)(parseFloat(data === null || data === void 0 ? void 0 : data.matchPrice), 0));
        }
        if (data === null || data === void 0 ? void 0 : data.price) {
            order.price = Math.max(0, (0, numbers_1.nz)(parseFloat(data === null || data === void 0 ? void 0 : data.price), 0));
        }
        if (order.price > 0) {
            order.origQuoteOrderQty = (0, numbers_1.nz)(order.price * order.origQty, 0);
            order.cummulativeQuoteQty = (0, numbers_1.nz)(order.price * order.executedQty, 0);
        }
        switch (data === null || data === void 0 ? void 0 : data.type) {
            case 'open':
                order.status = IOrder_1.OrderStatus.NEW;
                break;
            case 'canceled':
                order.status = IOrder_1.OrderStatus.CANCELED;
                break;
            case 'match':
            case 'update':
                order.status = IOrder_1.OrderStatus.PARTIALLY_FILLED;
                break;
            case 'filled':
                order.status = IOrder_1.OrderStatus.FILLED;
                break;
        }
        if ((data === null || data === void 0 ? void 0 : data.status) === 'done') {
            order.status = IOrder_1.OrderStatus.FILLED;
        }
        this.emit('stream:order', {
            provider: this.id,
            message: order,
        });
    }
    _onTickerStreamMessage(message) {
        const { time, candles } = message.data;
        const topicParts = message.topic.split(':')[1].split('_');
        const [baseAsset, quoteAsset] = topicParts[0].split('-');
        const interval = caeb_types_1.ICandleChartIntervalInSeconds.ONE_MINUTE;
        const openTime = parseFloat(candles[0]) * 1000;
        const isNew = message.subject.includes('.update') ? false : true;
        const lastUpdateSeconds = Math.floor(time / 1000);
        const streamObj = 'stream:ticker';
        const streamKey = [streamObj, this.id, baseAsset, quoteAsset, interval].join('-');
        if (this.streamKeyDuplicate[streamKey] !== lastUpdateSeconds) {
            this.streamKeyDuplicate[streamKey] = lastUpdateSeconds;
            const ticker = {
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
    __getAllOrders(baseAsset, quoteAsset, status, tradeType = 'TRADE', daysRange = 365) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbol = baseAsset && quoteAsset ? this.formatSymbol(baseAsset, quoteAsset) : undefined;
            const daysLimit = 7;
            const dailyMs = 86400 * 1000;
            let startAt = Date.now() - dailyMs * daysLimit;
            let endAt = Date.now();
            const finalDate = startAt - dailyMs * daysRange;
            const limit = (0, p_limit_1.default)(1);
            const input = [];
            while (endAt > finalDate) {
                input.push(limit(() => this.__getAllOrdersRequest({ tradeType, symbol, status, endAt, startAt, baseAsset, quoteAsset })));
                input.push(limit(() => (0, timeout_1.timeout)(334)));
                startAt -= dailyMs * daysLimit;
                endAt -= dailyMs * daysLimit;
            }
            const results = yield Promise.all(input);
            return [].concat(...results).filter(o => o);
        });
    }
    __getAllOrdersRequest(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const orders = [];
            const { tradeType, symbol, status, endAt, startAt } = obj;
            const req = yield this.client.rest.Trade.Orders.getOrdersList(tradeType, {
                symbol,
                status,
                endAt,
                startAt,
            });
            if (!req.data) {
                this.log.warn('No data:', { req, code: req.code });
                if (req.code === '429000') {
                    this._onApiRatioLimitsErrorCode();
                    return this.__getAllOrdersRequest(obj);
                }
                return orders;
            }
            const _a = req === null || req === void 0 ? void 0 : req.data,
                { totalNum, totalPage, items } = _a,
                other = __rest(_a, ['totalNum', 'totalPage', 'items']);
            if (items && items.length) {
                for (const item of items) {
                    const [baseAsset, quoteAsset] = item.symbol.split('-');
                    const tickerInfo = yield this.getTickerInfo(baseAsset, quoteAsset);
                    orders.push((0, formatOrder_1.formatOrder)(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
                }
            }
            return orders;
        });
    }
    __getAllHistoricalOrders(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const orders = [];
            const { symbol, status, endAt, startAt, currentPage, pageSize } = obj;
            const req = yield this.client.rest.Trade.Orders.getV1HistoricalOrdersList({
                symbol,
                status,
                endAt,
                startAt,
                currentPage,
                pageSize,
            });
            const _a = req === null || req === void 0 ? void 0 : req.data,
                { totalNum, totalPage, items } = _a,
                other = __rest(_a, ['totalNum', 'totalPage', 'items']);
            if (items && items.length) {
                for (const item of items) {
                    const [baseAsset, quoteAsset] = item.symbol.split('-');
                    const tickerInfo = yield this.getTickerInfo(baseAsset, quoteAsset);
                    orders.push((0, formatOrder_1.formatOrder)(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
                }
            }
            return orders;
        });
    }
    __getAllOrdersPerPage(obj, currentPage = 1, pageSize = 500) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const orders = [];
            const { tradeType, symbol, status, baseAsset, quoteAsset, endAt, startAt, tickerInfo } = obj;
            const req = yield this.client.rest.Trade.Orders.getOrdersList(tradeType, {
                symbol,
                status,
                currentPage,
                pageSize,
                endAt,
                startAt,
            });
            const _a = req === null || req === void 0 ? void 0 : req.data,
                { totalNum, totalPage, items } = _a,
                other = __rest(_a, ['totalNum', 'totalPage', 'items']);
            if (items) {
                items.forEach(item => {
                    orders.push((0, formatOrder_1.formatOrder)(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
                });
            }
            return { orders, currentPage, pageSize, totalNum, totalPage };
        });
    }
}
exports.ProviderKucoin = ProviderKucoin;
