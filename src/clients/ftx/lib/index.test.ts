import { IAsset, ICandleChartIntervalKeys } from '../../common/interfaces';
import { ProviderFtx } from '.';
import { IProviderFtx } from '../interfaces/IProviderFtx';
import mock_account from '../__mocks__/account';

// Create a mocked provider
const createProvider = (account: IProviderFtx): ProviderFtx => {
    return new ProviderFtx(account);
};

// Setup test pair
const baseAsset = 'BTC';
const quoteAsset = 'USDT';

// Start tests
describe('test client', () => {
    it('should be defined', () => {
        expect(ProviderFtx).toBeDefined();
    });

    describe('setup', () => {
        let provider: ProviderFtx;
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
        let provider: ProviderFtx;
        beforeAll(() => {
            provider = createProvider(mock_account);
        });
        it('provider.getExchangeInfo()', async () => {
            const symbols: IAsset[] = await provider.getExchangeInfo();
            expect(symbols).toBeInstanceOf(Array);
        });
        it('provider.getTickerInfo()', async () => {
            const asset: IAsset = await provider.getTickerInfo(baseAsset, quoteAsset);
            expect(asset.baseAsset).toBe(baseAsset);
            expect(asset.quoteAsset).toBe(quoteAsset);
        });
        it('provider.getPrice()', async () => {
            const price: number = await provider.getPrice(baseAsset, quoteAsset);
            expect(typeof price).toBe('number');
        });
        it('provider.getHistory()', async () => {
            const candles = await provider.getHistory(baseAsset, quoteAsset, ICandleChartIntervalKeys.ONE_DAY, 7);
            expect(candles).toBeInstanceOf(Array);
        });
        it('provider.getVolatility()', async () => {
            const candles = await provider.getHistory(baseAsset, quoteAsset, ICandleChartIntervalKeys.ONE_DAY, 7);
            const [low, max, variation] = provider.getVolatility(candles);
            // console.log(low, max, variation);
            expect(typeof low).toBe('number');
            expect(typeof max).toBe('number');
            expect(typeof variation).toBe('number');
        });
    });

    describe('auth methods', () => {
        let provider: ProviderFtx;
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
        });

        describe('orders', () => {
            it('provider.getAllOrders(baseAsset, quoteAsset)', async () => {
                const orders = await provider.getAllOrders(baseAsset, quoteAsset, 14);
                expect(orders).toBeInstanceOf(Array);
            }, 60000);
            it('provider.getAllOrders()', async () => {
                const orders = await provider.getAllOrders(undefined, undefined, 14);
                expect(orders).toBeInstanceOf(Array);
            }, 60000);
            it('provider.getActiveOrders(baseAsset, quoteAsset)', async () => {
                const orders = await provider.getActiveOrders(baseAsset, quoteAsset, 14);
                // console.log('active orders', orders);
                expect(orders).toBeInstanceOf(Array);
            }, 60000);
            it('provider.getActiveOrders()', async () => {
                const orders = await provider.getActiveOrders(undefined, undefined, 14);
                // console.log('active orders', orders);
                expect(orders).toBeInstanceOf(Array);
            }, 60000);

            // it('provider.createOrderLimit()', async () => {
            //     const order = await provider.createOrderLimit('BUY', 0.001, 10000, baseAsset, quoteAsset);
            //     expect(order).toBeInstanceOf(Object);
            // }, 60000);

            // it('provider.cancelOpenOrders()', async () => {
            //     const status = await provider.cancelOpenOrders(baseAsset, quoteAsset);
            //     expect(status).toBe(true);
            // }, 60000);
        });
    });
});
