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
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProviderBinance = void 0;
const binance_api_node_1 = __importDefault(require('binance-api-node'));
const utils_1 = require('./utils');
const errors_1 = require('../../../utils/errors');
const numbers_1 = require('../../../utils/numbers/numbers');
const logger_1 = require('../../../utils/logger/logger');
const lib_1 = require('../../common/lib');
const caeb_types_1 = require('caeb-types');
class ProviderBinance extends lib_1.ProviderCommon {
    constructor(props) {
        super();
        this.name = 'binance';
        this.id = 'binance';
        this.httpBase = 'https://api.binance.com';
        this.httpBaseTestnet = 'https://testnet.binance.vision';
        this.testnet = false;
        this.recvWindow = 60000;
        this.weightLimitPerMinute = 1200;
        this.cacheSymbolsTTL = 60 * 60 * 1000;
        if (props && props.name) this.name = props.name;
        if (props && props.httpBase) this.httpBase = props.httpBase;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.testnet) this.testnet = props.testnet;
        if (props && props.recvWindow) this.recvWindow = props.recvWindow;
        if (!props.httpBase && props.testnet) {
            this.httpBase = this.httpBaseTestnet;
        }
        this.log = (0, logger_1.createLogger)(this.name.toUpperCase());
        this.client = (0, binance_api_node_1.default)({
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            httpBase: this.httpBase,
        });
    }
    attachStreamTicker(ticker) {
        throw new Error('Method not implemented.');
    }
    getExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cacheSymbols && this.cacheSymbols.length && Date.now() - this.cacheSymbolsLast < this.cacheSymbolsTTL) {
                return this.cacheSymbols;
            }
            const { symbols, rateLimits } = yield this.client.exchangeInfo();
            this.cacheSymbols = symbols.map(symbol => (0, utils_1.formatTickerInfo)(symbol));
            this.cacheSymbolsLast = Date.now();
            return this.cacheSymbols;
        });
    }
    getTickerInfo(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            const symbols = yield this.getExchangeInfo();
            const asset = symbols.find(s => s.baseAsset === baseAsset && s.quoteAsset === quoteAsset);
            if (!asset) throw new errors_1.ErrorInvalidSymbol(`${baseAsset} / ${quoteAsset}`);
            return asset;
        });
    }
    getHistory(baseAsset, quoteAsset, intervalType = caeb_types_1.ICandleChartIntervalKeys.ONE_DAY, opts = { limit: 200 }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            let intervalResolution;
            switch (intervalType) {
                case 'ONE_MINUTE':
                    intervalResolution = '1m';
                    break;
                case 'THREE_MINUTES':
                    intervalResolution = '3m';
                    break;
                case 'FIVE_MINUTES':
                    intervalResolution = '5m';
                    break;
                case 'FIFTEEN_MINUTES':
                    intervalResolution = '15m';
                    break;
                case 'THIRTY_MINUTES':
                    intervalResolution = '30m';
                    break;
                case 'ONE_HOUR':
                    intervalResolution = '1h';
                    break;
                case 'TWO_HOURS':
                    intervalResolution = '2h';
                    break;
                case 'FOUR_HOURS':
                    intervalResolution = '4h';
                    break;
                case 'SIX_HOURS':
                    intervalResolution = '6h';
                    break;
                case 'EIGHT_HOURS':
                    intervalResolution = '8h';
                    break;
                case 'TWELVE_HOURS':
                    intervalResolution = '12h';
                    break;
                case 'ONE_DAY':
                    intervalResolution = '1d';
                    break;
                case 'ONE_WEEK':
                    intervalResolution = '1w';
                    break;
            }
            const candles = yield this.client.candles({ symbol, interval: intervalResolution, limit: opts.limit });
            return candles.map(candle => (0, utils_1.formatCandle)(candle));
        });
    }
    getPrice(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const price = yield this.client.prices({ symbol });
            return parseFloat(price[symbol]);
        });
    }
    formatSymbol(baseAsset, quoteAsset) {
        return `${baseAsset}${quoteAsset}`;
    }
    getAccountBalances() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const { balances } = yield this.client.accountInfo({ useServerTime: true });
            return (0, utils_1.formatBalances)(balances);
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
            throw new Error('Method not implemented.');
        });
    }
    getAllOrders(baseAsset, quoteAsset, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const props = { symbol };
            if (orderId) props.orderId = orderId;
            if (this.recvWindow) props.recvWindow = this.recvWindow;
            const orders = yield this.client.allOrders(props);
            return orders.map(order => (0, utils_1.formatQueryOrder)(order, baseAsset, quoteAsset));
        });
    }
    getActiveOrders(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const orders = yield this.client.openOrders({ symbol });
            return orders.map(order => (0, utils_1.formatQueryOrder)(order, baseAsset, quoteAsset));
        });
    }
    createOrderLimit(side, quantity, price, baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const order = (0, utils_1.formatNewOrder)(
                yield this.client.order({
                    symbol,
                    side,
                    type: 'LIMIT',
                    quantity: quantity.toString(),
                    price: price.toString(),
                }),
                baseAsset,
                quoteAsset,
            );
            return order;
        });
    }
    createOrderMarket(props) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            throw new Error('Method not implemented.');
        });
    }
    cancelOpenOrders(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            this.log.debug('Cancel all Open Orders...');
            try {
                const orders = yield this.client.cancelOpenOrders({ symbol });
                return orders.map(order => (0, utils_1.formatCanceledOrder)(order));
            } catch (err) {
                this.log.error(`Not able to close OpenOrders : [${err.code}] ${err.message}`);
                return [];
            }
        });
    }
    attachStreamAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            const ws = yield this.client.ws.user(msg =>
                __awaiter(this, void 0, void 0, function* () {
                    if (msg.eventType && msg.eventType === 'executionReport') {
                        const symbols = yield this.getExchangeInfo();
                        const { baseAsset, quoteAsset } = symbols.find(s => this.formatSymbol(s.baseAsset, s.quoteAsset) === msg.symbol);
                        this.emit('order', (0, utils_1.formatWsOrder)(msg, baseAsset, quoteAsset));
                    } else {
                        this.log.trace(msg);
                    }
                }),
            );
            return ws;
        });
    }
    getApiRatioLimits() {
        return __awaiter(this, void 0, void 0, function* () {
            const info = yield this.client.getInfo();
            const limits = {
                spot: {
                    usedWeight1m: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.spot.usedWeight1m, 0),
                    orderCount10s: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.spot.orderCount10s, 0),
                    orderCount1m: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.spot.orderCount1m, 0),
                    orderCount1h: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.spot.orderCount1h, 0),
                    orderCount1d: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.spot.orderCount1d, 0),
                },
                futures: {
                    usedWeight1m: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.futures.usedWeight1m, 0),
                    orderCount10s: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.futures.orderCount10s, 0),
                    orderCount1m: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.futures.orderCount1m, 0),
                    orderCount1h: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.futures.orderCount1h, 0),
                    orderCount1d: (0, numbers_1.roundToCeil)(info === null || info === void 0 ? void 0 : info.futures.orderCount1d, 0),
                },
            };
            return limits;
        });
    }
    wsPing() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.futuresPing();
        });
    }
}
exports.ProviderBinance = ProviderBinance;
