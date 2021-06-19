export class ErrorProvider extends Error {
    constructor(public code: number, message: string) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.stack = new Error().stack;
        Error.captureStackTrace(this, this.constructor);
    }
}
