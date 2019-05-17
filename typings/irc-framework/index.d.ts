declare module 'irc-framework' {
    export function ircLineParser(line: string): Message | undefined;

    export class Message {
        public constructor(command: string | undefined, args: string[] | undefined)

        public tags: { [s: string]: string };
        public prefix: string;
        public nick: string;
        public ident: string;
        public hostname: string;
        public command: string;
        public params: string[];

        public to1459(): string;

        public toJSON(): {
            tags: { [s: string]: string },
            /**
             * = this.prefix
             */
            source: string,
            command: string,
            params: string[];
        };
    }
}