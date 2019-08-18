import { BaseError } from "../utils/base-error";

/**
 * Signifies some sort of timeout while waiting for something to complete
 */
export class TimeoutError extends BaseError {
  public constructor(message: string) {
    super(message);
  }
}
