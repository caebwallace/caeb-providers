import { IBalance } from '../../../common/interfaces';
interface AssetBalance {
    coin: string;
    total: number;
    free: number;
    availableWithoutBorrow: number;
    usdValue: number;
    spotBorrow: number;
}
export declare const formatBalances: (rawBalances: AssetBalance[], hideSmallBalances?: boolean) => IBalance[];
export {};
