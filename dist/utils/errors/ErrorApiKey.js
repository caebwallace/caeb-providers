'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ErrorApiKey = void 0;
const ErrorProvider_1 = require('./ErrorProvider');
class ErrorApiKey extends ErrorProvider_1.ErrorProvider {
    constructor(code, message) {
        super(code, message);
        this.code = code;
        this.code = 401;
    }
}
exports.ErrorApiKey = ErrorApiKey;
