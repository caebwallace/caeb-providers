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
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProviderFtx = void 0;
const ftx_api_1 = require('ftx-api');
const interfaces_1 = require('../../common/interfaces');
const logger_1 = require('../../../utils/logger/logger');
const formatTickerInfo_1 = require('./utils/formatTickerInfo');
const formatBalances_1 = require('./utils/formatBalances');
const formatOrder_1 = require('./utils/formatOrder');
const formatCandle_1 = require('./utils/formatCandle');
const ErrorInvalidSymbol_1 = require('../../../utils/errors/ErrorInvalidSymbol');
const numbers_1 = require('../../../utils/numbers/numbers');
const lib_1 = require('../../common/lib');
const CandleChartInterval_1 = require('../interfaces/CandleChartInterval');
const caeb_types_1 = require('caeb-types');
class ProviderFtx extends lib_1.ProviderCommon {
    constructor(props) {
        super();
        this.name = 'ftx';
        this.id = 'ftx';
        this.weightLimitPerMinute = 1800;
        this.cacheSymbolsTTL = 60 * 60 * 1000;
        if (props && props.name) this.name = props.name;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.subAccountName) this.subAccountName = props.subAccountName;
        this.log = (0, logger_1.createLogger)(this.name.toUpperCase());
        this.client = new ftx_api_1.RestClient(this.apiKey, this.apiSecret, {
            subAccountName: this.subAccountName,
        });
    }
    attachStreamTicker(ticker) {
        throw new Error('Method not implemented.');
    }
    getApiRatioLimits() {
        return __awaiter(this, void 0, void 0, function* () {});
    }
    getExchangeInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cacheSymbols && this.cacheSymbols.length && Date.now() - this.cacheSymbolsLast < this.cacheSymbolsTTL) {
                return this.cacheSymbols;
            }
            yield this.respectApiRatioLimits();
            const { result: symbols } = yield this.client.getMarkets();
            this.cacheSymbols = symbols.filter(s => s.type === 'spot').map(symbol => (0, formatTickerInfo_1.formatTickerInfo)(symbol));
            this.cacheSymbolsLast = Date.now();
            return this.cacheSymbols;
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
    getPrice(baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            const { result: ticker } = yield yield this.client.getMarket(symbol);
            const price = parseFloat(ticker.last);
            return price;
        });
    }
    getHistory(baseAsset, quoteAsset, intervalType = caeb_types_1.ICandleChartIntervalKeys.ONE_DAY, opts = { limit: 200 }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const symbol = this.formatSymbol(baseAsset, quoteAsset);
            let intervalResolution;
            switch (intervalType) {
                case 'ONE_MINUTE':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.ONE_MINUTE;
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
                case 'FOUR_HOURS':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.FOUR_HOURS;
                    break;
                case 'ONE_DAY':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.ONE_DAY;
                    break;
                case 'ONE_WEEK':
                    intervalResolution = CandleChartInterval_1.CandleChartInterval.ONE_WEEK;
                    break;
            }
            const intervalMs = caeb_types_1.ICandleChartIntervalInSeconds[intervalType] * 1000;
            const startAt = (0, numbers_1.roundToFloor)((Date.now() - intervalMs * opts.limit) / 1000, 0);
            const endAt = (0, numbers_1.roundToFloor)(Date.now() / 1000, 0);
            const { result: candles } = yield this.client.getHistoricalPrices({
                market_name: symbol,
                resolution: intervalResolution,
                start_time: startAt,
                end_time: endAt,
            });
            return candles.map(candle => (0, formatCandle_1.formatCandle)(candle, intervalMs));
        });
    }
    formatSymbol(baseAsset, quoteAsset) {
        return `${baseAsset}/${quoteAsset}`;
    }
    getAccountBalances() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const { result: balances } = yield this.client.getBalances();
            return (0, formatBalances_1.formatBalances)(balances || []);
        });
    }
    getAssetBalance(asset) {
        return __awaiter(this, void 0, void 0, function* () {
            const balances = yield this.getAccountBalances();
            return balances.find(a => a.asset === asset);
        });
    }
    getAllOrders(baseAsset, quoteAsset, daysRange) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__getAllOrdersRequest(baseAsset, quoteAsset, 'done', daysRange);
        });
    }
    getActiveOrders(baseAsset, quoteAsset, daysRange) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__getAllOrdersRequest(baseAsset, quoteAsset, 'active', daysRange);
        });
    }
    getAllOrdersForPairs(pairs, status, daysRange) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    createOrderLimit(side, quantity, price, baseAsset, quoteAsset) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const { result: order } = yield this.client.placeOrder({
                market: this.formatSymbol(baseAsset, quoteAsset),
                side: side === interfaces_1.OrderSide.BUY ? 'buy' : 'sell',
                price,
                size: quantity,
                type: 'limit',
                postOnly: true,
            });
            const tickerInfo = yield this.getTickerInfo(baseAsset, quoteAsset);
            return (0, formatOrder_1.formatOrder)(Object.assign(Object.assign({}, order), { baseAsset, quoteAsset }), tickerInfo);
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
            const { result, success } = yield this.client.cancelAllOrders({ market: this.formatSymbol(baseAsset, quoteAsset) });
            return success;
        });
    }
    attachStreamAccount() {
        throw new Error('Method not implemented.');
    }
    __getAllOrdersRequest(baseAsset, quoteAsset, status, daysRange = 365) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.respectApiRatioLimits();
            const orders = [];
            const dailyMs = 86400 * 1000;
            const startAt = (0, numbers_1.roundToFloor)((Date.now() - dailyMs * daysRange) / 1000, 0);
            const endAt = (0, numbers_1.roundToFloor)(Date.now() / 1000, 0);
            if (!this.cacheSymbols || !this.cacheSymbols.length) {
                yield this.getExchangeInfo();
            }
            const symbol = baseAsset && quoteAsset ? this.formatSymbol(baseAsset, quoteAsset) : undefined;
            let opts;
            if (symbol) opts = { market: symbol };
            const { success, result, hasMoreData } =
                status === 'active'
                    ? yield this.client.getOpenOrders(symbol)
                    : yield this.client.getOrderHistory(Object.assign(Object.assign({}, opts), { start_time: startAt, end_time: endAt }));
            if (result && result.length) {
                for (const item of result) {
                    const [marketBaseAsset, marketQuoteAsset] = item.market.split('/');
                    const tickerInfo = yield this.getTickerInfo(marketBaseAsset, marketQuoteAsset);
                    orders.push((0, formatOrder_1.formatOrder)(Object.assign(Object.assign({}, item), { marketBaseAsset, marketQuoteAsset }), tickerInfo));
                }
            }
            return orders;
        });
    }
}
exports.ProviderFtx = ProviderFtx;
