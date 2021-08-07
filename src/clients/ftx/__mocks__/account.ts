import 'dotenv-defaults/config';
export default {
    id: 'FTX TEST',
    name: 'FTX TEST',
    provider: 'ftx',
    apiKey: process.env.FTX_TESTNET_API_KEY,
    apiSecret: process.env.FTX_TESTNET_API_SECRET,
};
