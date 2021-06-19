export interface IAsset {
    baseAsset: string;
    quoteAsset: string;
    pricePrecision: number;
    quotePrecision: number;
    minPrice: number;
    maxPrice: number;
    minQty: number;
    stepSize: number;
    minNotional: number;
    status: string;
    maxNumOrders?: number;
}
