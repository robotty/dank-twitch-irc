import { CustomError } from 'ts-custom-error';

export class ValidationError extends CustomError {
    public constructor(message: string) {
        super(message);
    }
}
