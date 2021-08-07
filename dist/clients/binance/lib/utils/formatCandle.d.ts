import { CandleChartResult } from 'binance-api-node';
import { ICandle } from '../../../common/interfaces';
export declare const formatCandle: (candle: CandleChartResult) => ICandle;
