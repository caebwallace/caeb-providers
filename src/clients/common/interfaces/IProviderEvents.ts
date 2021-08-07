import { IOrder } from './IOrder';

export interface IProviderEvents {
    error: (error: Error) => void;
    message: (payload: any) => void;
    order: (payload: IOrder) => void;
}
