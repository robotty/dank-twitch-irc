// eslint-disable-next-line
import { BaseMessageEmitter, TwitchMessagePrototype } from './messageemitter';
import { IRCMessage, TwitchMessage } from './message/message';
import { NoticeMessage } from './message/types';
import flatMap from 'lodash.flatmap';
import VError from 'verror';

export class ResponseConditions {
    public noticeIDs: string[] = [];
    public commands: string[] = [];
    public types: TwitchMessagePrototype<any>[] = [];
    public tMatcher: (m: TwitchMessage) => boolean = () => true;
    public iMatcher: (m: IRCMessage) => boolean = () => true;
    public matcher: (m: IRCMessage | TwitchMessage) => boolean = () => true;

    public constructor(values: Partial<ResponseConditions> = {}) {
        Object.assign(this, values);
    }

    public matchIRCMessage(ircMessage: IRCMessage): boolean {
        return this.commands.includes(ircMessage.command) &&
            this.iMatcher(ircMessage) &&
            this.matcher(ircMessage);
    }

    public matchTwitchMessage(message: TwitchMessage): boolean {
        if (message instanceof NoticeMessage &&
            this.noticeIDs.includes(message.messageID)) {
            return true;
        }

        if (this.commands.includes(message.command)) {
            return true;
        }

        // priority is tMatcher -> iMatcher -> matcher
        if (this.tMatcher(message) || this.iMatcher(message.ircMessage) || this.matcher(message)) {
            return true;
        }

        return this.types.includes(Object.getPrototypeOf(message));
    }

}

enum MatchResult {
    Success,
    Failure,
    NoMatch
}

export class AwaitResponseConfiguration {
    public success: ResponseConditions = new ResponseConditions();
    public failure: ResponseConditions = new ResponseConditions();
    public timeout: number;

    public constructor(success: ResponseConditions, failure: ResponseConditions, timeout: number) {
        this.success = success;
        this.failure = failure;
        this.timeout = timeout;
    }

    public matchIRCMessage(ircMessage: IRCMessage): MatchResult {
        if (this.failure.matchIRCMessage(ircMessage)) {
            return MatchResult.Failure;
        }

        if (this.success.matchIRCMessage(ircMessage)) {
            return MatchResult.Success;
        }

        return MatchResult.NoMatch;
    }

    public matchTwitchMessage(message: TwitchMessage): MatchResult {
        if (this.failure.matchTwitchMessage(message)) {
            return MatchResult.Failure;
        }

        if (this.success.matchTwitchMessage(message)) {
            return MatchResult.Success;
        }

        return MatchResult.NoMatch;
    }
}

export class TimeoutError extends VError {
}

export function awaitResponse(emitter: BaseMessageEmitter,
                              success: Partial<ResponseConditions> = {},
                              failure: Partial<ResponseConditions> = {},
                              timeout: number = 2000): Promise<IRCMessage | TwitchMessage> {
    let config: AwaitResponseConfiguration = new AwaitResponseConfiguration(
        new ResponseConditions(success),
        new ResponseConditions(failure),
        timeout
    );

    return new Promise<IRCMessage | TwitchMessage>((_resolve, _reject) => {
        let unsubscribers: (() => void)[] = [];

        let unsubscribe = (): void => {
            unsubscribers.forEach(e => e());
        };

        let resolve = (msg: IRCMessage | TwitchMessage): void => {
            unsubscribe();
            _resolve(msg);
        };

        let reject = (error: Error): void => {
            unsubscribe();
            _reject(error);
        };

        let timeout = setTimeout(() => {
            reject(new TimeoutError(`Promise timed out after ${config.timeout} milliseconds`));
        }, config.timeout);
        unsubscribers.push(() => {
            clearTimeout(timeout);
        });

        unsubscribers.push(emitter.onError.sub(e => {
            reject(e);
        }));

        unsubscribers.push(emitter.onClose.sub(hadError => {
            reject(new Error(`Connection closed with error=${hadError}`));
        }));

        let respondToMatch = (matchResult: MatchResult, message: IRCMessage | TwitchMessage): void => {
            switch (matchResult) {
                case MatchResult.Failure:
                    reject(new Error('Bad response: ' + message.ircMessage.rawSource));
                    break;
                case MatchResult.Success:
                    resolve(message);
            }
        };

        unsubscribers.push(emitter.onUnparsedMessage.sub(ircMessage => {
            respondToMatch(config.matchIRCMessage(ircMessage), ircMessage);
        }));

        for (let type of flatMap([ config.success, config.failure ], e => e.types)) {
            unsubscribers.push(emitter.subscribe(type, msg => {
                respondToMatch(config.matchTwitchMessage(msg), msg);
            }));
        }
    });
}
