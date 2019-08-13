import { BaseError } from "make-error-cause";

export function causeOf(error: Error): Error | undefined {
  if (error instanceof BaseError) {
    return error.cause;
  }
  return undefined;
}

export function anyCauseInstanceof(
  error: Error | undefined,
  constructor: any
): boolean {
  let currentError: Error | undefined = error;

  while (currentError != null) {
    if (currentError instanceof constructor) {
      return true;
    }
    currentError = causeOf(currentError);
  }

  return false;
}
