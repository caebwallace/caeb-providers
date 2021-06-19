import { CandleChartResult } from 'binance-api-node';
import { ICandle } from '../../../../interfaces/';
export declare const formatCandle: (candle: CandleChartResult) => ICandle;
