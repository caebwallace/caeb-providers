'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProviderTerra = void 0;
const terra_js_1 = require('@terra-money/terra.js');
const lib_1 = require('../../common/lib');
class ProviderTerra extends lib_1.ProviderCommon {
    constructor(props) {
        super();
        this.name = 'terra';
        this.id = 'terra';
        this.client = terra_js_1.LCDClient;
        if (props && props.name) this.name = props.name;
        if (props && props.apiKey) this.apiKey = props.apiKey;
        if (props && props.apiSecret) this.apiSecret = props.apiSecret;
        if (props && props.testnet) this.testnet = props.testnet;
        this.client = new terra_js_1.LCDClient({
            URL: 'https://lcd.terra.dev',
            chainID: 'columbus-3',
        });
    }
    getExchangeInfo() {
        throw new Error('Method not implemented.');
    }
    getPrice(baseAsset, quoteAsset) {
        throw new Error('Method not implemented.');
    }
    getTickerInfo(baseAsset, quoteAsset) {
        throw new Error('Method not implemented.');
    }
    getHistory(baseAsset, quoteAsset, intervalType, limit) {
        throw new Error('Method not implemented.');
    }
    formatSymbol(baseAsset, quoteAsset) {
        throw new Error('Method not implemented.');
    }
    getAccountBalances() {
        throw new Error('Method not implemented.');
    }
    getAssetBalance(asset) {
        throw new Error('Method not implemented.');
    }
    getAllOrders(baseAsset, quoteAsset, daysRange) {
        throw new Error('Method not implemented.');
    }
    getActiveOrders(baseAsset, quoteAsset, daysRange) {
        throw new Error('Method not implemented.');
    }
    createOrderLimit(side, quantity, price, baseAsset, quoteAsset) {
        throw new Error('Method not implemented.');
    }
    cancelOpenOrders(baseAsset, quoteAsset) {
        throw new Error('Method not implemented.');
    }
    listenUserEvents() {
        throw new Error('Method not implemented.');
    }
}
exports.ProviderTerra = ProviderTerra;
