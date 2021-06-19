'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ErrorInvalidAddress = void 0;
const ErrorProvider_1 = require('./ErrorProvider');
class ErrorInvalidAddress extends ErrorProvider_1.ErrorProvider {
    constructor() {
        super(5000, `Invalid wallet address`);
    }
}
exports.ErrorInvalidAddress = ErrorInvalidAddress;
