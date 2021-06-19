import 'dotenv-defaults/config';
export default {
    id: 'Kucoin TEST',
    name: 'Kucoin TEST',
    provider: 'kucoin',
    apiKey: process.env.KUCOIN_TESTNET_API_KEY,
    apiSecret: process.env.KUCOIN_TESTNET_API_SECRET,
    apiPassPhrase: process.env.KUCOIN_TESTNET_API_PASSPHRASE,
    testnet: true,
};
