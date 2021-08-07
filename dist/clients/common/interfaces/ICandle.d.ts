export interface ICandle {
    openTime: Date;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: Date;
    quoteVolume?: number;
    trades?: number;
    baseAssetVolume?: number;
    quoteAssetVolume?: number;
}
