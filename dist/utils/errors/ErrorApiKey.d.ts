import { ErrorProvider } from './ErrorProvider';
export declare class ErrorApiKey extends ErrorProvider {
    code: number;
    constructor(code: number, message: string);
}
