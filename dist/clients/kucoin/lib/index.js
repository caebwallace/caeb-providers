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
const interfaces_1 = require('../../common/interfaces');
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
class ProviderKucoin extends lib_1.ProviderCommon {
    constructor(props) {
        super();
        this.name = 'kucoin';
        this.id = 'kucoin';
        this.httpBase = 'https://openapi-v2.kucoin.com';
        this.httpBaseTestnet = 'https://openapi-sandbox.kucoin.com';
        this.testnet = false;
        this.weightLimitPerMinute = 1800;
        this.client = ClientKucoin;
        this.cacheSymbolsTTL = 60 * 60 * 1000;
        if (props && props.name) this.name = props.name;
        if (props && props.httpBase) this.httpBase = props.httpBase;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.apiPassPhrase) this.apiPassPhrase = props.apiPassPhrase;
        if (props && props.testnet) this.testnet = props.testnet;
        if (!props.httpBase && props.testnet) {
            this.httpBase = this.httpBaseTestnet;
        }
        this.log = logger_1.createLogger(this.name.toUpperCase());
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
    getExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cacheSymbols && this.cacheSymbols.length && Date.now() - this.cacheSymbolsLast < this.cacheSymbolsTTL) {
                return this.cacheSymbols;
            }
            yield this.respectApiRatioLimits();
            const { data: symbols } = yield this.client.rest.Market.Symbols.getSymbolsList();
            this.cacheSymbols = symbols.map(symbol => formatTickerInfo_1.formatTickerInfo(symbol));
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
    getHistory(baseAsset, quoteAsset, intervalType = interfaces_1.ICandleChartIntervalKeys.ONE_DAY, limit = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const interval = CandleChartInterval_1.CandleChartInterval[intervalType];
            const intervalMs = interfaces_1.ICandleChartIntervalInSeconds[intervalType] * 1000;
            const startAt = numbers_1.roundToFloor((Date.now() - intervalMs * limit) / 1000, 0);
            const endAt = numbers_1.roundToFloor(Date.now() / 1000, 0);
            const { data: candles } = yield this.client.rest.Market.Histories.getMarketCandles(symbol, interval, { startAt, endAt });
            return candles.map(candle => formatCandle_1.formatCandle(candle, intervalMs));
        });
    }
    formatSymbol(baseAsset, quoteAsset) {
        return `${baseAsset}-${quoteAsset}`;
    }
    getAccountBalances() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const { data: balances } = yield this.client.rest.User.Account.getAccountsList();
            return formatBalances_1.formatBalances(balances || []);
        });
    }
    getAssetBalance(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.getAccountBalances();
            return balances.find(a => a.asset === asset);
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
                orders.push(formatOrder_1.formatOrder(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
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
    listenUserEvents() {
        throw new Error('Method not implemented.');
    }
    getApiRatioLimits() {
        return __awaiter(this, void 0, void 0, function* () {});
    }
    __getAllOrders(baseAsset, quoteAsset, status, tradeType = 'TRADE', daysRange = 365) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = baseAsset && quoteAsset ? this.formatSymbol(baseAsset, quoteAsset) : undefined;
            const daysLimit = 7;
            const dailyMs = 86400 * 1000;
            let startAt = Date.now() - dailyMs * daysLimit;
            let endAt = Date.now();
            const finalDate = startAt - dailyMs * daysRange;
            const limit = p_limit_1.default(3);
            const input = [];
            while (endAt > finalDate) {
                input.push(limit(() => this.__getAllOrdersRequest({ tradeType, symbol, status, endAt, startAt, baseAsset, quoteAsset })));
                input.push(limit(() => timeout_1.timeout(200)));
                startAt -= dailyMs * daysLimit;
                endAt -= dailyMs * daysLimit;
            }
            const results = yield Promise.all(input);
            return [].concat(...results).filter(o => o);
        });
    }
    __getAllOrdersRequest(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const orders = [];
            const { tradeType, symbol, status, endAt, startAt } = obj;
            const req = yield this.client.rest.Trade.Orders.getOrdersList(tradeType, {
                symbol,
                status,
                endAt,
                startAt,
            });
            const _a = req === null || req === void 0 ? void 0 : req.data,
                { totalNum, totalPage, items } = _a,
                other = __rest(_a, ['totalNum', 'totalPage', 'items']);
            if (items && items.length) {
                for (const item of items) {
                    const [baseAsset, quoteAsset] = item.symbol.split('-');
                    const tickerInfo = yield this.getTickerInfo(baseAsset, quoteAsset);
                    orders.push(formatOrder_1.formatOrder(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
                }
            }
            return orders;
        });
    }
    __getAllHistoricalOrders(obj) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    orders.push(formatOrder_1.formatOrder(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
                }
            }
            return orders;
        });
    }
    __getAllOrdersPerPage(obj, currentPage = 1, pageSize = 500) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    orders.push(formatOrder_1.formatOrder(Object.assign(Object.assign({}, item), { baseAsset, quoteAsset }), tickerInfo));
                });
            }
            return { orders, currentPage, pageSize, totalNum, totalPage };
        });
    }
}
exports.ProviderKucoin = ProviderKucoin;
