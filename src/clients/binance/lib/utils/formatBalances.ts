import { nz } from '../../../../utils/numbers/numbers';
import { AssetBalance } from 'binance-api-node';
import { IBalance } from '../../../common/interfaces';

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
    const balances: IBalance[] = rawBalances.map((b: AssetBalance) => {
        return {
            asset: b.asset,
            free: nz(parseFloat(b.free), 0),
            locked: nz(parseFloat(b.locked), 0),
        };
    });
    return hideSmallBalances ? balances.filter(a => a.free || a.locked) : balances;
};
