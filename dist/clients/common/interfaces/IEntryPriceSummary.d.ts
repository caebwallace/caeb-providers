export interface IEntryPriceSummary {
    baseAsset: string;
    quoteAsset: string;
    amount: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    metas: [
        {
            accountId: string;
            providerId: string;
            quoteAsset: string;
            amount: number;
            price: number;
        },
    ];
}
