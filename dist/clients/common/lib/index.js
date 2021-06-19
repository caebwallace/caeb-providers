'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
exports.ProviderCommon = void 0;
const events_1 = __importDefault(require('events'));
const timeout_1 = require('../../../utils/timeout/timeout');
const logger_1 = require('../../../utils/logger/logger');
const numbers_1 = require('../../../utils/numbers/numbers');
class ProviderCommon extends events_1.default {
    constructor() {
        super();
        this.weightLimitPerMinute = 1;
        this.name = 'common';
        this.weightLimitLevels = [
            { type: 'EMERGENCY', ratio: 0.8, waitTimeMS: 30000 },
            { type: 'WARNING', ratio: 0.75, waitTimeMS: 20000 },
            { type: 'CAUTION', ratio: 0.5, waitTimeMS: 10000 },
        ];
        this.log = logger_1.createLogger(this.name.toUpperCase());
    }
    getVolatility(candles) {
        let low = 0;
        let high = 0;
        candles.forEach(candle => {
            low = numbers_1.nz(Math.min(low, candle.low), candle.low) || candle.low;
            high = numbers_1.nz(Math.max(high, candle.high), candle.high) || candle.high;
        });
        return [low, high, numbers_1.getVariation(low, high)];
    }
    getApiRatioLimits() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error('Method not implemented.');
        });
    }
    respectApiRatioLimits() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const limits = yield this.getApiRatioLimits();
            const spotLimit = (_a = limits === null || limits === void 0 ? void 0 : limits.spot) === null || _a === void 0 ? void 0 : _a.usedWeight1m;
            for (const limit of this.weightLimitLevels) {
                if (spotLimit > this.weightLimitPerMinute * limit.ratio) {
                    this.log.warn(
                        `[API LIMIT] ${limit.type} Take a break (${limit.waitTimeMS}ms) to avoid IP ban : ${spotLimit} / ${this.weightLimitPerMinute}`,
                    );
                    yield timeout_1.timeout(limit.waitTimeMS);
                }
            }
        });
    }
}
exports.ProviderCommon = ProviderCommon;
