import { IAsset, ICandleChartIntervalKeys } from '../../common/interfaces';
import { ProviderBinance } from '.';
import { IProviderBinance } from '../interfaces/IProviderBinance';

import mock_account from '../__mocks__/account';

// Create a mocked provider
const createProvider = (account: IProviderBinance): ProviderBinance => {
    return new ProviderBinance(account);
};

// Setup test pair
const baseAsset = 'BTC';
const quoteAsset = 'USDT';

// Start tests
describe('test client', () => {
    it('should be defined', () => {
        expect(ProviderBinance).toBeDefined();
    });

    describe('setup', () => {
        let provider: ProviderBinance;
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
        let provider: ProviderBinance;
        beforeAll(() => {
            provider = createProvider(mock_account);
        });
        it('provider.getExchangeInfo()', async () => {
            const symbols: IAsset[] = await provider.getExchangeInfo();
            // console.log(symbols);
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
            // console.log(low, max, variation);
            expect(typeof low).toBe('number');
            expect(typeof max).toBe('number');
            expect(typeof variation).toBe('number');
        });
        it('provider.getPrice()', async () => {
            const price = await provider.getPrice(baseAsset, quoteAsset);
            expect(typeof price).toBe('number');
        });
    });

    describe('auth methods', () => {
        let provider: ProviderBinance;
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
            it('provider.getAllOrders()', async () => {
                expect(provider.getAllOrders).toBeDefined();
                const orders = await provider.getAllOrders(baseAsset, quoteAsset);
                // console.log(balances);
            });

            // it('provider.createOrderLimit()', async () => {
            //     const order = await provider.createOrderLimit('BUY', 0.00001, 800, baseAsset, quoteAsset);
            // });

            // describe('orders', () => {
            //     it('provider.cancelOpenOrders()', async () => {
            //         const closedOrders = await provider.cancelOpenOrders(baseAsset, quoteAsset);
            //         // console.log('closedOrders', closedOrders);
            //     });
            // });
        });
    });
});
