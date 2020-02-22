/**
 * A wrapper around <code>setTimeout()</code> and <code>clearTimeout()</code>
 * that allows the timer to be edited to complete earlier or later,
 * relative to its original start time.
 */
export class EditableTimeout {
  public readonly callback: () => void;

  public readonly startTime: number;
  public runTime: number;

  public runningTimeout: NodeJS.Timeout | undefined;
  public completed = false;

  public constructor(callback: () => void, runTime: number) {
    this.callback = callback;
    this.startTime = Date.now();

    /**
     * Time in milliseconds of when <code>callback</code> should be invoked,
     * relative to {@link startTime}.
     */
    this.runTime = runTime;

    this.updateTimer();
  }

  public stop(): boolean {
    if (this.runningTimeout == null) {
      // no stop was performed
      return false;
    } else {
      clearTimeout(this.runningTimeout);
      return true;
    }
  }

  public update(newRunTime: number): void {
    if (this.completed) {
      return;
    }

    this.runTime = newRunTime;

    this.updateTimer();
  }

  private updateTimer(): void {
    this.stop();

    // calculate time the new setTimeout needs to run
    let timeRemaining;
    if (this.runningTimeout == null) {
      // this is the first invocation by the constructor
      timeRemaining = this.runTime;
    } else {
      const currentTime = Date.now();
      const alreadyPassed = currentTime - this.startTime;
      timeRemaining = this.runTime - alreadyPassed;
    }

    this.runningTimeout = setTimeout(
      this.invokeCallback.bind(this),
      timeRemaining
    );
  }

  private invokeCallback(): void {
    this.completed = true;
    this.callback();
  }
}
