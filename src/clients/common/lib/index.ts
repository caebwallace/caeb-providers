import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { timeout } from '../../../utils/timeout/timeout';
import { createLogger, Logger } from '../../../utils/logger/logger';
import { getVariation, nz } from '../../../utils/numbers/numbers';
import { ICandle, IProviderEvents } from '../interfaces';
import { IProviderCommon } from '../interfaces/IProviderCommon';

// Provider Common methods
export class ProviderCommon extends (EventEmitter as new () => TypedEmitter<IProviderEvents>) implements IProviderCommon {
    /**
     * Define the max wheight to avoid banning.
     *
     * @type {Binance}
     * @memberof ProviderCommon
     */
    weightLimitPerMinute: number = 1;

    /**
     * The name of the provider.
     *
     * @type {string}
     * @memberof ProviderCommon
     */
    public name: string = 'common';

    /**
     * The logger.
     *
     * @type {Logger}
     * @memberof ProviderCommon
     */
    public log: Logger;

    /**
     * Init the Provider with config.
     *
     * @param {IProviderCommon} props - The class properties.
     * @memberof ProviderCommon
     */
    constructor() {
        super();

        // Create logger
        this.log = createLogger(this.name.toUpperCase());
    }

    /**
     * Define API Ratio limit levels behaviors : will pause request if weight API ratio is too high, to avoid IP ban.
     *
     * @type {{ type: string; ratio: number; waitTimeMS: number }[]}
     * @memberof ProviderCommon
     */
    public weightLimitLevels: { type: string; ratio: number; waitTimeMS: number }[] = [
        { type: 'EMERGENCY', ratio: 0.8, waitTimeMS: 30000 },
        { type: 'WARNING', ratio: 0.75, waitTimeMS: 20000 },
        { type: 'CAUTION', ratio: 0.5, waitTimeMS: 10000 },
    ];

    /**
     * Calculate volatility from candles.
     *
     * @param {ICandle[]} candles - The candles formatted.
     * @returns {[low: number, high: number, variation: number]} - The volatility params.
     * @memberof ProviderCommon
     */
    public getVolatility(candles: ICandle[]): [low: number, high: number, variation: number] {
        let low: number = 0;
        let high: number = 0;
        candles.forEach(candle => {
            low = nz(Math.min(low, candle.low), candle.low) || candle.low;
            high = nz(Math.max(high, candle.high), candle.high) || candle.high;
        });
        return [low, high, getVariation(low, high)];
    }

    /**
     * Get API Ratio limits from API.
     *
     * @memberof ProviderCommon
     */
    public async getApiRatioLimits(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    /**
     * Pause request if API Ratio Limits are too high.
     * Should be called before each client request.
     *
     * @memberof ProviderCommon
     */
    public async respectApiRatioLimits(): Promise<void> {
        // Take a break if ratio approach limits.
        for (const limit of this.weightLimitLevels) {
            const limits = await this.getApiRatioLimits();
            const spotLimit = limits?.spot?.usedWeight1m;
            if (spotLimit > this.weightLimitPerMinute * limit.ratio) {
                this.log.warn(`[API LIMIT] ${limit.type} Take a break (${limit.waitTimeMS}ms) to avoid IP ban : ${spotLimit} / ${this.weightLimitPerMinute}`);
                await timeout(limit.waitTimeMS);
                continue;
            }
        }

        // this.log.trace('API LIMITS', limits);
    }
}
