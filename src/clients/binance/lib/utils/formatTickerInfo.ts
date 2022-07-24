import { IAsset } from 'caeb-types';
import { nz } from '../../../../utils/numbers/numbers';

/**
 * Format a ticker info to get IAsset.
 *
 * @private
 * @param {*} asset - The asset to format.
 * @returns {IAsset} - Returns a formated asset.
 * @memberof ProviderBinance
 */
export const formatTickerInfo = (asset: any): IAsset => {
    const filterPrice: any = asset.filters?.find((a: any) => a.filterType === 'PRICE_FILTER');
    const filterLotSize: any = asset.filters?.find((a: any) => a.filterType === 'LOT_SIZE');
    const filterMaxNumOrders: any = asset.filters?.find((a: any) => a.filterType === 'MAX_NUM_ORDERS');
    const filterMinNotional: any = asset.filters?.find((a: any) => a.filterType === 'MIN_NOTIONAL');
    return {
        baseAsset: asset.baseAsset,
        quoteAsset: asset.quoteAsset,
        status: asset.status,
        pricePrecision: nz(parseFloat(asset.baseAssetPrecision), 8),
        quotePrecision: nz(parseFloat(asset.quotePrecision), 8),
        maxNumOrders: nz(filterMaxNumOrders?.maxNumOrders, 0),
        minPrice: nz(parseFloat(filterPrice?.minPrice), 0),
        maxPrice: nz(parseFloat(filterPrice?.maxPrice), 0),
        minQty: nz(parseFloat(filterLotSize?.minQty), 0),
        stepSize: nz(parseFloat(filterLotSize?.stepSize), 0),
        minNotional: nz(parseFloat(filterMinNotional?.minNotional), 0.1),
    };
};
