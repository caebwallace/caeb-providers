'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.ErrorProvider = void 0;
class ErrorProvider extends Error {
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = this.constructor.name;
        this.code = code;
        this.stack = new Error().stack;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ErrorProvider = ErrorProvider;
