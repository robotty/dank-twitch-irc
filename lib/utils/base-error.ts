import * as makeErrorCause from "make-error-cause";

export class BaseError extends makeErrorCause.BaseError {
  public constructor(message?: string, cause?: Error | undefined) {
    let newMessage;
    if (
      message != null &&
      cause != null &&
      cause.message != null &&
      cause.message.length > 0
    ) {
      newMessage = `${message}: ${cause.message}`;
    } else if (message != null) {
      newMessage = message;
    } else if (cause != null && cause.message != null) {
      newMessage = cause.message;
    } else {
      newMessage = "";
    }

    super(newMessage, cause);
  }
}
