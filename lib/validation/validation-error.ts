import { BaseError } from "make-error-cause";

export class ValidationError extends BaseError {
  public constructor(message: string) {
    super(message);
  }
}
