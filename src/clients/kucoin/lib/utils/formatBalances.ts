import { IBalance } from '../../../../interfaces/';
import { nz } from '../../../../utils/numbers/numbers';

// Local Asset Balance interface
interface AssetBalance {
    id: string;
    currency: string;
    type: string;
    balance: string;
    available: string;
    holds: string;
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
        const balance: IBalance = balances.find(n => n.asset === b.currency);
        if (balance) {
            balance.free += nz(parseFloat(b.available), 0);
            balance.locked += nz(parseFloat(b.holds), 0);
        } else {
            balances.push({
                asset: b.currency,
                free: nz(parseFloat(b.available), 0),
                locked: nz(parseFloat(b.holds), 0),
            });
        }
    });
    return hideSmallBalances ? balances.filter(a => a.free || a.locked) : balances;
};
