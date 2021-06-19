'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ErrorInvalidProvider = void 0;
const ErrorProvider_1 = require('./ErrorProvider');
class ErrorInvalidProvider extends ErrorProvider_1.ErrorProvider {
    constructor() {
        super(40002, `InvalidProvider : A provider must be set.`);
    }
}
exports.ErrorInvalidProvider = ErrorInvalidProvider;
