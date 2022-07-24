export interface IStreamTicker {
    provider: string;
    baseAsset: string;
    quoteAsset: string;
    interval: number;
    time: number;
    new: boolean;
    candle: {
        t: number;
        o: number;
        c: number;
        h: number;
        l: number;
        v?: number;
    };
}
