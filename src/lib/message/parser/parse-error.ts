import { BaseError } from 'make-error-cause';

export class ParseError extends BaseError {
    public constructor(message: string, badSrc?: string, cause?: Error) {
        if (badSrc == null) {
            super(message, cause);
        } else {
            super(`${message} (bad source: ${badSrc})`);
        }
    }
}
