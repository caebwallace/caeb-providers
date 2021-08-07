export interface IProviderTerra {
    name: string;
    apiKey: string;
    apiSecret: string;
    apiUrl?: string;
    apiPassPhrase?: string;
    apiVersion?: string;
    httpBase?: string;
    testnet?: boolean;
}
