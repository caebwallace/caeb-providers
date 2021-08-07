import { IAsset } from '../../../common/interfaces';
import { countDecimals, nz } from '../../../../utils/numbers/numbers';

/**
 * Format a ticker info to get IAsset.
 *
 * @private
 * @param {*} asset - The asset to format.
 * @returns {IAsset} - Returns a formated asset.
 * @memberof ProviderBinance
 */
export const formatTickerInfo = (asset: any): IAsset => {
    // console.log(asset);
    // if (asset.baseCurrency === 'BTC' && asset.quoteCurrency === 'USDT') {
    //     console.log('TickerInfo', asset, parseFloat(asset.baseIncrement), countDecimals(parseFloat(asset.baseIncrement)));
    // }
    return {
        baseAsset: asset.baseCurrency,
        quoteAsset: asset.quoteCurrency,
        status: asset.enableTrading ? 'TRADING' : 'LISTING',
        pricePrecision: nz(countDecimals(parseFloat(asset.baseIncrement)), 8),
        quotePrecision: nz(countDecimals(parseFloat(asset.quoteIncrement)), 8),
        minPrice: nz(parseFloat(asset.baseMinSize), 0),
        maxPrice: nz(parseFloat(asset.baseMaxSize), 0),
        minQty: nz(parseFloat(asset.baseMinSize), 0),
        stepSize: nz(parseFloat(asset.baseIncrement), 0),
        minNotional: nz(parseFloat(asset.quoteMinSize), 0.1),
    };
};
