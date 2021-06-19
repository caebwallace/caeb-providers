import { ErrorProvider } from './ErrorProvider';
export class ErrorApiKey extends ErrorProvider {
    constructor(public code: number, message: string) {
        super(code, message);
        this.code = 401;
    }
}
