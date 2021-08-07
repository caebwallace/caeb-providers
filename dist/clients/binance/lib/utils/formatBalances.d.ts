import { AssetBalance } from 'binance-api-node';
import { IBalance } from '../../../common/interfaces';
export declare const formatBalances: (rawBalances: AssetBalance[], hideSmallBalances?: boolean) => IBalance[];
