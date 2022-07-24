export interface IOrder {
    orderId: string;
    clientOrderId: string;
    baseAsset: string;
    quoteAsset: string;
    status: TOrderStatus;
    type: TOrderType;
    side: TOrderSide;
    price: number;
    origQty: number;
    executedQty?: number;
    cummulativeQuoteQty: number;
    origQuoteOrderQty?: number;
    fee?: number;
    feeCurrency?: string;
    createdAt: Date;
    updatedAt?: Date;
}
export interface IOrderMarketProps {
    side: OrderSide;
    quantity: number;
    baseAsset: string;
    quoteAsset: string;
    clientOrderId?: string;
}
export declare enum OrderStatus {
    'CANCELED' = 'CANCELED',
    'EXPIRED' = 'EXPIRED',
    'FILLED' = 'FILLED',
    'NEW' = 'NEW',
    'PARTIALLY_FILLED' = 'PARTIALLY_FILLED',
    'PENDING_CANCEL' = 'PENDING_CANCEL',
    'REJECTED' = 'REJECTED',
}
export declare enum OrderSide {
    'BUY' = 'BUY',
    'SELL' = 'SELL',
}
export declare enum OrderType {
    'LIMIT' = 'LIMIT',
    'LIMIT_MAKER' = 'LIMIT_MAKER',
    'MARKET' = 'MARKET',
    'STOP' = 'STOP',
    'STOP_LOSS_LIMIT' = 'STOP_LOSS_LIMIT',
    'STOP_MARKET' = 'STOP_MARKET',
    'TAKE_PROFIT_MARKET' = 'TAKE_PROFIT_MARKET',
    'TAKE_PROFIT_LIMIT' = 'TAKE_PROFIT_LIMIT',
    'TRAILING_STOP_MARKET' = 'TRAILING_STOP_MARKET',
}
export declare type TOrderSide = keyof typeof OrderSide;
export declare type TOrderStatus = keyof typeof OrderStatus;
export declare type TOrderType = keyof typeof OrderType;
