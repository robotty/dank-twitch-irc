declare module "debug-logger" {
  import { Debug, Debugger } from "debug";
  import { InspectOptions } from "util";

  /**
   * Properties available on the function returned by <code>require('debug-logger')</code>.
   */
  namespace debugLogger {
    /**
     * A single log function at a determined log namespace and level, e.g. <code>my-app:info</code>.
     */
    export interface LogFn {
      /**
       * Outputs the message using the root/default debug instance, without the level suffix.
       * @param args Arguments to format
       */
      (...args: any[]): void;

      /**
       * Numerical level value, e.g. <code>0</code> for <code>trace</code>,
       * and <code>5</code> for <code>error</code>.
       */
      level: number;

      /**
       * A string of shell escape codes to activate this logger's color.
       */
      color: string;

      /**
       * A string of shell escape codes to deactivate this logger's color.
       */
      reset: string;

      /**
       * Shell escape code used to specially highlight the beginning of inspected objects.
       *
       * Defaults to underline (see {@link debugLogger#styles}).
       */
      inspectionHighlight: string;

      /**
       * Returns the default debug instance used by this level.
       */
      logger(): Debugger;

      /**
       * Boolean indicating if level's logger is enabled.
       */
      enabled(): boolean;
    }

    /**
     * A single debug logger created with a namespace, e.g. by <code>require('debug-logger')('my-app')</code>.
     */
    export type Logger = {
      /**
       * Minimum log level that is actually output.
       * <code>0</code> (i.e. <code>trace</code>) by default,
       * Setting the <code>DEBUG_LEVEL</code> environment variable
       * will increase this number.
       */
      logLevel: number;

      /**
       * Storage for start times recorded by {@link Logger#time time()} invocations.
       */
      timeLabels: {
        // hrtime as returned by process.hrtime()
        [label: string]: [number, number];
      };

      /**
       * Mark the beginning of a time difference measurement.
       * @param label string label
       */
      time(label: string): void;

      /**
       * Finish timer, record output. level will determine the logger used to output the result
       * (defaults to 'log'). Returns duration in ms.
       * @param label Label used in call to {@link Logger#time time()}.
       * @param level Level to determine the logger to output the logged message on.
       */
      timeEnd(label: string, level?: string): number;

      /**
       * Inspect <code>obj</code>.
       *
       * @param obj The object to inspect.
       * @param level Optional log level, e.g. "warn".
       */
      dir(obj: any, level?: string): void;

      /**
       * Inspect <code>obj</code>.
       *
       * @param obj The object to inspect.
       * @param options Options passed to <code>util.inspect()</code>
       * @param level Optional log level, e.g. "warn".
       */
      dir(obj: any, options?: InspectOptions, level?: string): void;

      /**
       * Similar to <code>console.assert()</code>.
       * Additionally it outputs the error using the appropriate logger set by level (defaults to 'error').
       * @param expression boolean expresion to test
       * @param message Optional message to format <code>AssertionError</code> with.
       * @param formatArgs arguments passed to <code>util.format</code> to format the given
       * <code>message</code>.
       */
      assert(expression: boolean, message?: string, ...formatArgs: any[]): void;

      /**
       * Similar to <code>console.assert()</code>.
       * Additionally it outputs the error using the appropriate logger set by level (defaults to 'error').
       * @param expression boolean expresion to test
       * @param message Optional message to format <code>AssertionError</code> with.
       * @param formatArg1 argument passed to <code>util.format</code> to format the given
       * <code>message</code>.
       * @param level Chooses to logger to output message with, <code>error</code> by default.
       */
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        formatArg3: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        formatArg3: any,
        formatArg4: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        formatArg3: any,
        formatArg4: any,
        formatArg5: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        formatArg3: any,
        formatArg4: any,
        formatArg5: any,
        formatArg6: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        formatArg3: any,
        formatArg4: any,
        formatArg5: any,
        formatArg6: any,
        formatArg7: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        formatArg3: any,
        formatArg4: any,
        formatArg5: any,
        formatArg6: any,
        formatArg7: any,
        formatArg8: any,
        level: string
      ): void;
      assert(
        expression: boolean,
        message: string,
        formatArg1: any,
        formatArg2: any,
        formatArg3: any,
        formatArg4: any,
        formatArg5: any,
        formatArg6: any,
        formatArg7: any,
        formatArg8: any,
        formatArg9: any,
        level: string
      ): void;
    } & {
      /**
       * Provides access to all the specific level loggers, e.g. at <code>trace</code>, <code>warn</code>, etc..
       */
      [level: string]: LogFn;
    };

    /**
     * Configures what logging levels are available and their properties
     */
    export interface Levels {
      [levelName: string]: {
        /**
         * A string of shell escape codes to activate this level's color.
         */
        color: string;

        /**
         * A string of shell escape codes to deactivate this level's color.
         */
        prefix: string;

        /**
         * namespace suffix to append to the base namespace of the {@link Logger}, e.g.
         * <code>:trace</code>
         */
        namespaceSuffix: string;

        /**
         * Numeric level, e.g <code>0</code> for <code>trace</code> or <code>5</code> for <code>error</code>.
         */
        level: number;

        /**
         * Specifies the file descriptor to send output to.
         * stderr (2) by default. Use 1 to specify stdout.
         */
        fd?: number;
      };
    }

    /**
     * Configures the <code>debug-logger</code> instance.
     */
    export interface DebugLoggerConfig {
      /**
       * Ensure that output from this module always beings after a newline on the terminal.
       * If you are using the console to output things not ending in a newline, e.g. progress bars,
       * and a logger function prints data while the console is not positioned on a new line,
       * <code>debug-logger</code> will insert a newline first to ensure a new line beings before log output
       * is printed.
       */
      ensureNewline?: boolean;

      /**
       * Specifies custom inspect options under use.
       */
      inspectOptions?: InspectOptions;

      /**
       * Configures what logging levels are available and their properties
       */
      levels?: Levels;
    }

    /**
     * Controls the <code>debug</code> library under use. Defaults to <code>require("debug")</code>
     */
    let debug: Debug;

    /**
     * Cache of debug instances from the <code>debug</code> module.
     */
    let debugInstances: {
      [namespace: string]: Debugger;
    };

    /**
     * Can be used to configure this module.
     */
    let config: (config: DebugLoggerConfig) => typeof debugLogger;

    /**
     * Specifies custom inspect options under use.
     */
    let inspectOptions: InspectOptions;

    /**
     * Convenience string -> number mapping to access these common colors:
     *
     * black, red, green, yellow, blue, magenta, cyan, white
     */
    let colors: { [key: string]: number };

    /**
     * Convenience string -> terminal escape code mapping for these styles:
     *
     * underline
     */
    let styles: { [styleName: string]: string };

    /**
     * Terminal escape code to disable/reset color for the following output
     */
    let colorReset: string;

    /**
     * Configures what logging levels are available and their properties
     */
    let levels: Levels;
  }

  /**
   * Creates a new {@link Logger} with the given namespace.
   *
   * @param namespace namespace of the new logger
   */
  function debugLogger(namespace: string): debugLogger.Logger;

  export = debugLogger;
}
