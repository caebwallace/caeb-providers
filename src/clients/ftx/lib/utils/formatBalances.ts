import { IBalance } from '../../../common/interfaces';
import { nz } from '../../../../utils/numbers/numbers';

// Local Asset Balance interface
interface AssetBalance {
    coin: string;
    total: number;
    free: number;
    availableWithoutBorrow: number;
    usdValue: number;
    spotBorrow: number;
}

/**
 * Format balances to IBalance and hideSmallBalances if asked.
 *
 * @private
 * @param {AssetBalance[]} rawBalances - The account AssetBalance array.
 * @param {boolean} [hideSmallBalances=false] - Either to filter small balances or not.
 * @returns {IBalance[]} - Formated balances.
 * @memberof ProviderBinance
 */
export const formatBalances = (rawBalances: AssetBalance[], hideSmallBalances: boolean = false): IBalance[] => {
    const balances: IBalance[] = [];
    rawBalances.forEach((b: AssetBalance) => {
        const balance: IBalance = balances.find(n => n.asset === b.coin);
        if (balance) {
            balance.free += nz(b.free, 0);
            balance.locked += nz(b.total - b.free, 0);
        } else {
            balances.push({
                asset: b.coin,
                free: nz(b.free, 0),
                locked: nz(b.total - b.free, 0),
            });
        }
    });
    return hideSmallBalances ? balances.filter(a => a.free || a.locked) : balances;
};
