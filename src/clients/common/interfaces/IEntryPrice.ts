export interface IEntryPrice {
    accountId: string;
    providerId: string;
    baseAsset: string;
    quoteAsset: string;
    price: number;
    amount: number;
    createdAt?: Date;
    updatedAt?: Date;
}
