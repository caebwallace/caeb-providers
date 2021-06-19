import { ErrorProvider } from './ErrorProvider';

export class ErrorInvalidSymbol extends ErrorProvider {
    constructor(message: string) {
        super(40001, `InvalidSymbol : ${message}`);
    }
}
