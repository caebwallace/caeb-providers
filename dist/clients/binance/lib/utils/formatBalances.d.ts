import { IBalance } from '../../../../interfaces/';
import { AssetBalance } from 'binance-api-node';
export declare const formatBalances: (rawBalances: AssetBalance[], hideSmallBalances?: boolean) => IBalance[];
