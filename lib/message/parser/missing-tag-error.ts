import { reasonForValue } from "../../utils/reason-for-value";
import { MissingDataError } from "./missing-data-error";

export class MissingTagError extends MissingDataError {
  public constructor(
    public tagKey: string,
    public actualValue: string | null | undefined,
    cause?: Error
  ) {
    super(
      `Required tag value not present at key "${tagKey}" (is ${reasonForValue(
        actualValue
      )})`,
      cause
    );
  }
}
