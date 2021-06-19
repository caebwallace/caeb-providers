import { ErrorProvider } from './ErrorProvider';

export class ErrorInvalidAddress extends ErrorProvider {
    constructor() {
        super(5000, `Invalid wallet address`);
    }
}
