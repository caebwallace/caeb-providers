import { IAsset, ICandleChartIntervalKeys } from 'caeb-types';
import { ProviderKucoin } from '.';
import { IProviderKucoin } from '../interfaces/IProviderKucoin';
import mock_account from '../__mocks__/account';

// Create a mocked provider
const createProvider = (account: IProviderKucoin): ProviderKucoin => {
    return new ProviderKucoin(account);
};

// Setup test pair
const baseAsset = 'BTC';
const quoteAsset = 'USDT';

// Start tests
describe('test client', () => {
    let provider: ProviderKucoin;
    it('should be defined', () => {
        expect(ProviderKucoin).toBeDefined();
    });

    describe('setup', () => {
        beforeAll(() => {
            provider = createProvider(mock_account);
        });
        it('should be defined', () => {
            expect(provider).toBeDefined();
            expect(provider.id).toBeDefined();
            expect(provider.name).toBeDefined();
            expect(provider.apiKey).toBeDefined();
            expect(provider.apiSecret).toBeDefined();
            expect(provider.client).toBeDefined();
        });
    });

    describe('public methods', () => {
        beforeAll(() => {
            provider = createProvider(mock_account);
        });
        it('provider.getExchangeInfo()', async () => {
            const symbols: IAsset[] = await provider.getExchangeInfo();
            expect(symbols).toBeInstanceOf(Array);
        });
        it('provider.getPrice()', async () => {
            const price: number = await provider.getPrice(baseAsset, quoteAsset);
            expect(typeof price).toBe('number');
        });
        it('provider.getTickerInfo()', async () => {
            const asset: IAsset = await provider.getTickerInfo(baseAsset, quoteAsset);
            expect(asset.baseAsset).toBe(baseAsset);
            expect(asset.quoteAsset).toBe(quoteAsset);
        });
        it('provider.getHistory()', async () => {
            const candles = await provider.getHistory(baseAsset, quoteAsset, ICandleChartIntervalKeys.ONE_DAY, { limit: 7 });
            expect(candles).toBeInstanceOf(Array);
        });
        it('provider.getVolatility()', async () => {
            const candles = await provider.getHistory(baseAsset, quoteAsset, ICandleChartIntervalKeys.ONE_DAY, { limit: 7 });
            const [low, max, variation] = provider.getVolatility(candles);
            // console.log(low, max, variation);
            expect(typeof low).toBe('number');
            expect(typeof max).toBe('number');
            expect(typeof variation).toBe('number');
        });
    });

    describe('user methods', () => {
        beforeAll(() => {
            provider = createProvider(mock_account);
        });
        describe('account', () => {
            it('provider.getAccountBalances()', async () => {
                const balances = await provider.getAccountBalances();
                expect(balances).toBeInstanceOf(Array);
            });

            it('provider.getAssetBalance()', async () => {
                const balance = await provider.getAssetBalance(quoteAsset);
                expect(typeof balance.asset).toBe('string');
                expect(typeof balance.free).toBe('number');
                expect(typeof balance.locked).toBe('number');
            });

            it('provider.innerTransfer()', async () => {
                const txId_TRADE_FUNDING = await provider.innerTransfer(`caeb-tp-${Date.now()}`, 'USDT', 1, 'TRADE_FUNDING');
                expect(typeof txId_TRADE_FUNDING).toBe('string');

                const txId_FUNDING_TRADE = await provider.innerTransfer(`caeb-tp-${Date.now()}`, 'USDT', 1, 'FUNDING_TRADE');
                expect(typeof txId_FUNDING_TRADE).toBe('string');
            });
        });
        describe('orders', () => {
            it('provider.getAllOrders()', async () => {
                const orders = await provider.getAllOrders(baseAsset, quoteAsset, 14);
                // console.log('done orders', orders);
                expect(orders).toBeInstanceOf(Array);
            }, 60000);
            // it('provider.getActiveOrders()', async () => {
            //     const orders = await provider.getActiveOrders(baseAsset, quoteAsset, 365);
            //     // console.log('active orders', orders);
            //     expect(orders).toBeInstanceOf(Array);
            // }, 60000);

            // it('provider.getAllOrders()', async () => {
            //     const orders = await provider.getAllOrders('UOS', quoteAsset, 365);
            //     // console.log('done orders', orders);
            //     expect(orders).toBeInstanceOf(Array);
            // }, 60000);

            // it('provider.getAllOrdersForPairs()', async () => {
            //     const orders = await provider.getAllOrdersForPairs([{ baseAsset: 'ETH', quoteAsset: 'USDT' }], 'done', 14);
            //     // console.log('done orders', orders);
            //     expect(orders).toBeInstanceOf(Array);
            // }, 60000);

            // it('provider.__getAllOrdersByPage()', async () => {
            //     const tradeType = 'TRADE';
            //     const symbol = 'UOS-USDT';
            //     const orders = await provider.__getAllOrdersPerPage({ tradeType, symbol, baseAsset, quoteAsset }, 1, 500);
            //     console.log('all orders', orders);
            //     expect(orders).toBeInstanceOf(Array);
            // }, 60000);

            // it('provider.cancelOpenOrders()', async () => {
            //     const closedOrders = await provider.cancelOpenOrders(baseAsset, quoteAsset);
            //     // console.log('closedOrders', closedOrders);
            //     expect(closedOrders).toBeInstanceOf(Array);
            // }, 60000);
        });
    });
});
