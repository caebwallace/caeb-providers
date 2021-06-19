import { IAsset, ICandleChartIntervalKeys } from '../../../interfaces';
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
        });
        it('provider.getHistory()', async () => {
            const candles = await provider.getHistory(baseAsset, quoteAsset, ICandleChartIntervalKeys.ONE_DAY, 7);
            expect(candles).toBeInstanceOf(Array);
        });
        it('provider.getVolatility()', async () => {
            const candles = await provider.getHistory(baseAsset, quoteAsset, ICandleChartIntervalKeys.ONE_DAY, 7);
            const [low, max, variation] = provider.getVolatility(candles);
            expect(typeof low).toEqual('number');
            expect(typeof max).toEqual('number');
            expect(typeof variation).toEqual('number');
        });
    });

    describe('user methods', () => {
        beforeAll(() => {
            provider = createProvider(mock_account);
        });
        it('provider.getAccountBalances()', async () => {
            const balances = await provider.getAccountBalances();
            expect(balances).toBeInstanceOf(Array);
        });

        describe('orders', () => {
            it('provider.getAllOrders()', async () => {
                const orders = await provider.getAllOrders(baseAsset, quoteAsset, 365);
                // console.log('done orders', orders);
                expect(orders).toBeInstanceOf(Array);
            }, 60000);
            it('provider.getActiveOrders()', async () => {
                const orders = await provider.getActiveOrders(baseAsset, quoteAsset, 365);
                // console.log('active orders', orders);
                expect(orders).toBeInstanceOf(Array);
            }, 60000);
            // it('provider.cancelOpenOrders()', async () => {
            //     const closedOrders = await provider.cancelOpenOrders(baseAsset, quoteAsset);
            //     // console.log('closedOrders', closedOrders);
            //     expect(closedOrders).toBeInstanceOf(Array);
            // }, 60000);
        });
    });
});
