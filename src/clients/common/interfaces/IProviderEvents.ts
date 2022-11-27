import { IOrder } from './IOrder';

export interface IProviderEvents {
    error: (error: Error) => void;
    message: (payload: any) => void;
    order: (payload: IOrder) => void;
    'stream:balance': (payload: any) => void;
    'stream:order': (payload: any) => void;
    'stream:ticker': (payload: any) => void;
    'stream:close': (payload: { provider: string; reason?: number }) => void;
}
