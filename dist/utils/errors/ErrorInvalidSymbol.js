'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ErrorInvalidSymbol = void 0;
const ErrorProvider_1 = require('./ErrorProvider');
class ErrorInvalidSymbol extends ErrorProvider_1.ErrorProvider {
    constructor(message) {
        super(40001, `InvalidSymbol : ${message}`);
    }
}
exports.ErrorInvalidSymbol = ErrorInvalidSymbol;
