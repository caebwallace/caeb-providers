export interface IProviderBinance {
    name: string;
    apiKey: string;
    apiSecret: string;
    apiUrl?: string;
    apiVersion?: string;
    httpBase?: string;
    testnet?: boolean;
    recvWindow?: number;
}
