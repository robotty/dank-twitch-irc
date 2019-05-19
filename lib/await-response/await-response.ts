// eslint-disable-next-line
import { BaseMessageEmitter } from '../messageemitter';
import * as VError from 'verror';
import { alwaysFalse, Condition } from './conditions';
import { Message } from '../message/message';

export class AwaitResponseConfiguration {
    public success: Condition;
    public failure: Condition;
    public timeout: number;

    public constructor(success: Condition, failure: Condition, timeout: number) {
        this.success = success;
        this.failure = failure;
        this.timeout = timeout;
    }
}

// just a new class for marking/instanceof checks
export class TimeoutError extends VError {
}

export function awaitResponse(emitter: BaseMessageEmitter,
                              success: Condition = alwaysFalse,
                              failure: Condition = alwaysFalse,
                              timeout: number = 2000): Promise<Message> {
    return new Promise<Message>((_resolve, _reject) => {
        let unsubscribers: (() => void)[] = [];

        let unsubscribe = (): void => {
            unsubscribers.forEach(e => e());
        };

        let resolve = (msg: Message): void => {
            unsubscribe();
            _resolve(msg);
        };

        let reject = (error: Error): void => {
            unsubscribe();
            _reject(error);
        };

        let beginTimeout = (): void => {
            let registeredTimeout = setTimeout(() => {
                reject(new TimeoutError(`Promise timed out after ${registeredTimeout} milliseconds`));
            }, timeout);
            unsubscribers.push(() => {
                clearTimeout(registeredTimeout);
            });
        };

        // timeout only starts once connection is established
        if (emitter.connected) {
            beginTimeout();
        } else {
            unsubscribers.push(emitter.onConnect.sub(() => {
                beginTimeout();
            }));
        }

        unsubscribers.push(emitter.onError.sub(e => {
            reject(e);
        }));

        unsubscribers.push(emitter.onClose.sub(hadError => {
            reject(new Error(`Connection closed with error=${hadError}`));
        }));

        unsubscribers.push(emitter.onMessage.sub(msg => {
            if (failure(msg)) {
                reject(new Error(`Bad response message: ${msg.rawSource}`));
                return;
            }

            if (success(msg)) {
                resolve(msg);
                return;
            }
        }));
    });
}
