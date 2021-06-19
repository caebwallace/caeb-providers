import 'dotenv-defaults/config';
export default {
    id: 'Binance TEST',
    name: 'Binance TEST',
    provider: 'binance',
    apiKey: process.env.BINANCE_TESTNET_API_KEY,
    apiSecret: process.env.BINANCE_TESTNET_API_SECRET,
    testnet: true,
};
