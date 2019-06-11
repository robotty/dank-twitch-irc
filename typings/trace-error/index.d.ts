declare module 'trace-error' {

    // ECMAScript Error
    interface ECMAError {
        name: string;
        message: string;
        stack?: string;
    }

    /**
     * Serialized form of {@link Exception} instances.
     */
    interface ExceptionJson {
        /**
         * Stack trace of this error.
         */
        stack?: string;

        /**
         * Custom detail message. Empty string if not set explicitly.
         */
        message: string;

        /**
         * Class name of the serialized instance (e.g. "MyCustomError")
         */
        name: string;

        /**
         * If you have `Exception.searchPrototype` enabled
         * the properties of the exception class will be copied into
         * this interface. If that property is set to `false` however
         * no extra properties will be present.
         */
        [x: string]: any;
    }

    /**
     * Extended {@link Error} class that holds a few extra properties.
     */
    class Exception extends Error implements ECMAError {
        public static searchPrototype: boolean;

        public name: string;

        /**
         * Behaviour of this method depends on the `searchPrototype` setting.
         *
         * If `searchPrototype` is `true`, this method will fully serialize this instance
         * by traversing the prototype hierarchy and copying all properties into the returned object.
         *
         * If `searchPrototype` is `false`, this method will only contain the keys
         * `stack`, `message` and `name`. (See `ExceptionJson` type for more details.)
         */
        public toJSON(): ExceptionJson;
    }

    /**
     * Public API class to extend your errors from.
     */
    class TraceError extends Exception {
        /**
         * Provides a reference to the base class of this type
         */
        public static Exception: typeof Exception;

        /**
         * @param message Message string or object to stringify into the message.
         * @param causes List of causes of this `TraceError`.
         */
        public constructor(message?: string, ...causes: Error[]);

        /**
         * Get the cause at the specified index.
         * @param index Index to lookup. 0 if not specified.
         */
        public cause(index?: number): Error | undefined;

        /**
         * Get a list of all the causes
         */
        public causes(): Error[];

        /**
         * Get a list of all the messages
         */
        public messages(): string[];

        /**
         * Custom detail message. Empty string if not set explicitly.
         */
        public message: string;

        /**
         * Class name of the serialized instance (e.g. "MyCustomError")
         */
        public name: string;

        /**
         * Property on error objects that returns the stack as a string. 'stack' by default.
         *
         * Can be further customized via. inheritance and/or prototype modification.
         */
        public static globalStackProperty: string;

        /**
         * Indent to use for cause exceptions. 4 spaces by default.
         */
        public static indent: string;
    }

    // import this module with "import TraceError = require('trace-error')" in TypeScript
    export = TraceError;

}
