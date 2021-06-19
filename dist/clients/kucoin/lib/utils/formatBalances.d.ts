import { IBalance } from '../../../../interfaces/';
interface AssetBalance {
    id: string;
    currency: string;
    type: string;
    balance: string;
    available: string;
    holds: string;
}
export declare const formatBalances: (rawBalances: AssetBalance[], hideSmallBalances?: boolean) => IBalance[];
export {};
