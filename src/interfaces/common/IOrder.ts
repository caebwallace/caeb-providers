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

export enum OrderStatus {
    'CANCELED' = 'CANCELED',
    'EXPIRED' = 'EXPIRED',
    'FILLED' = 'FILLED',
    'NEW' = 'NEW',
    'PARTIALLY_FILLED' = 'PARTIALLY_FILLED',
    'PENDING_CANCEL' = 'PENDING_CANCEL',
    'REJECTED' = 'REJECTED',
}

export enum OrderSide {
    'BUY' = 'BUY',
    'SELL' = 'SELL',
}

export enum OrderType {
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

export type TOrderSide = keyof typeof OrderSide;
export type TOrderStatus = keyof typeof OrderStatus;
export type TOrderType = keyof typeof OrderType;
