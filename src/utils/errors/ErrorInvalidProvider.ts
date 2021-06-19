import { ErrorProvider } from './ErrorProvider';

export class ErrorInvalidProvider extends ErrorProvider {
    constructor() {
        super(40002, `InvalidProvider : A provider must be set.`);
    }
}
