'use strict';
var __createBinding =
    (this && this.__createBinding) ||
    (Object.create
        ? function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              Object.defineProperty(o, k2, {
                  enumerable: true,
                  get: function () {
                      return m[k];
                  },
              });
          }
        : function (o, m, k, k2) {
              if (k2 === undefined) k2 = k;
              o[k2] = m[k];
          });
var __setModuleDefault =
    (this && this.__setModuleDefault) ||
    (Object.create
        ? function (o, v) {
              Object.defineProperty(o, 'default', { enumerable: true, value: v });
          }
        : function (o, v) {
              o['default'] = v;
          });
var __importStar =
    (this && this.__importStar) ||
    function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };
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
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProviderBinance = void 0;
const binance_api_node_1 = __importStar(require('binance-api-node'));
const interfaces_1 = require('../../../interfaces');
const utils_1 = require('./utils');
const errors_1 = require('../../../utils/errors');
const numbers_1 = require('../../../utils/numbers/numbers');
const logger_1 = require('../../../utils/logger/logger');
const index_1 = require('../../common/lib/index');
class ProviderBinance extends index_1.ProviderCommon {
    constructor(props) {
        super();
        this.name = 'binance';
        this.id = 'binance';
        this.httpBase = 'https://api.binance.com';
        this.httpBaseTestnet = 'https://testnet.binance.vision';
        this.testnet = false;
        this.recvWindow = 60000;
        this.weightLimitPerMinute = 1200;
        if (props && props.name) this.name = props.name;
        if (props && props.httpBase) this.httpBase = props.httpBase;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.testnet) this.testnet = props.testnet;
        if (props && props.recvWindow) this.recvWindow = props.recvWindow;
        if (!props.httpBase && props.testnet) {
            this.httpBase = this.httpBaseTestnet;
        }
        this.log = logger_1.createLogger(this.name.toUpperCase());
        this.client = binance_api_node_1.default({
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            httpBase: this.httpBase,
        });
    }
    getExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const { symbols, rateLimits } = yield this.client.exchangeInfo();
            return symbols.map(symbol => utils_1.formatTickerInfo(symbol));
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
    getHistory(baseAsset, quoteAsset, intervalType = interfaces_1.ICandleChartIntervalKeys.ONE_DAY, limit = 200) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const interval = binance_api_node_1.CandleChartInterval[intervalType];
            const candles = yield this.client.candles({ symbol, interval, limit });
            return candles.map(candle => utils_1.formatCandle(candle));
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
            return utils_1.formatBalances(balances);
        });
    }
    getAssetBalance(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.getAccountBalances();
            return balances.find(a => a.asset === asset);
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
            return orders.map(order => utils_1.formatQueryOrder(order, baseAsset, quoteAsset));
        });
    }
    getActiveOrders(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const orders = yield this.client.openOrders({ symbol });
            return orders.map(order => utils_1.formatQueryOrder(order, baseAsset, quoteAsset));
        });
    }
    createOrderLimit(side, quantity, price, baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const order = utils_1.formatNewOrder(
                yield this.client.order({
                    symbol,
                    side,
                    type: binance_api_node_1.OrderType.LIMIT,
                    quantity: quantity.toString(),
                    price: price.toString(),
                }),
                baseAsset,
                quoteAsset,
            );
            return order;
        });
    }
    cancelOpenOrders(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            this.log.debug('Cancel all Open Orders...');
            try {
                const orders = yield this.client.cancelOpenOrders({ symbol });
                return orders.map(order => utils_1.formatCanceledOrder(order));
            } catch (err) {
                this.log.error(`Not able to close OpenOrders : [${err.code}] ${err.message}`);
                return [];
            }
        });
    }
    listenUserEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            const ws = yield this.client.ws.user(msg =>
                __awaiter(this, void 0, void 0, function* () {
                    if (msg.eventType && msg.eventType === 'executionReport') {
                        const symbols = yield this.getExchangeInfo();
                        const { baseAsset, quoteAsset } = symbols.find(s => this.formatSymbol(s.baseAsset, s.quoteAsset) === msg.symbol);
                        this.emit('order', utils_1.formatWsOrder(msg, baseAsset, quoteAsset));
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
                    usedWeight1m: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.spot.usedWeight1m, 0),
                    orderCount10s: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.spot.orderCount10s, 0),
                    orderCount1m: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.spot.orderCount1m, 0),
                    orderCount1h: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.spot.orderCount1h, 0),
                    orderCount1d: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.spot.orderCount1d, 0),
                },
                futures: {
                    usedWeight1m: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.futures.usedWeight1m, 0),
                    orderCount10s: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.futures.orderCount10s, 0),
                    orderCount1m: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.futures.orderCount1m, 0),
                    orderCount1h: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.futures.orderCount1h, 0),
                    orderCount1d: numbers_1.roundToCeil(info === null || info === void 0 ? void 0 : info.futures.orderCount1d, 0),
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
