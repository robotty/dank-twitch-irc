import { BaseError } from 'make-error-cause';

export class MessageError extends BaseError {
    public constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}

/**
 * Marks an error that mandates a disconnect of a single connection,
 * but must not necessarily mean that a multi-connection client as a whole must disconnect
 */
export class ConnectionError extends BaseError {
    public constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}

/**
 * Marks an error that mandates a disconnect of the whole client and all its connections,
 * e.g. a login error.
 */
export class ClientError extends ConnectionError {
    public constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}
