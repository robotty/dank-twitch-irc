import { CustomError } from 'ts-custom-error';

/**
 * Signifies some sort of timeout while waiting for something to complete
 */
export class TimeoutError extends CustomError {
    public constructor(message: string) {
        super(message);
    }
}
