import { BaseError } from "../utils/base-error";

export class ValidationError extends BaseError {
  public constructor(message: string) {
    super(message);
  }
}
