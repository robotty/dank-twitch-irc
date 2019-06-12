import { IClient } from '../client/interface';
import { alwaysFalse, Condition } from './conditions';
import { Message } from '../message';
import { setDefaults } from '../utils';
import { TimeoutError } from './timeout-error';
import { MessageError } from '../client/errors';
import { ISignal } from 'strongly-typed-events';

interface AwaitConfig {

    /**
     * If this condition evaluates to true on any incoming message, the promise is resolved with the message
     * that matched.
     */
    success: Condition;

    /**
     * If this condition evaluates to true on any incoming message, the promise is rejected with an
     * error specifying the cause message.
     */
    failure: Condition;

    /**
     * If neither the success or failure condition match on any message within this period, the promise is rejected
     * with a {@link TimeoutError}.
     */
    timeout: number;

    timeoutAction: 'success' | 'failure';

    errorType: (message, cause) => Error;

    /**
     * An extra message to include in the thrown exception if `critical` is set and the promise is rejected.
     */
    errorMessage: string;

    /**
     * Minimum connection state that must be reached before the timeout begins ticking.
     */
    timeoutMinimumState: 'none' | 'connected' | 'ready';
}

const configDefaults: AwaitConfig = {
    success: alwaysFalse,
    failure: alwaysFalse,
    timeout: 2000,
    timeoutAction: 'failure',
    errorType: (m, e) => new MessageError(m, e),
    errorMessage: 'Critical response was not received from the server',
    timeoutMinimumState: 'ready'
};

const events: { [key: string]: (c: IClient) => [boolean, ISignal | undefined] } = {
    'none': () => [true, undefined],
    'connected': c => [c.ready, c.onReady],
    'ready': c => [c.ready, c.onReady]
};

export function awaitResponse(client: IClient, config: Partial<AwaitConfig> = {}): Promise<Message> {
    let {
        success,
        failure,
        timeout,
        timeoutAction,
        errorType,
        errorMessage,
        timeoutMinimumState
    } = setDefaults(config, configDefaults);

    return new Promise<Message>((_resolve, _reject) => {
        let unsubscribers: (() => void)[] = [];

        let unsubscribe = (): void => {
            unsubscribers.forEach(e => e());
        };

        let resolve = (msg: Message): void => {
            unsubscribe();
            _resolve(msg);
        };

        let reject = (cause: Error): void => {
            unsubscribe();

            let errorWithCause = errorType(errorMessage, cause);
            client.dispatchError(errorWithCause);
            _reject(errorWithCause);
        };

        let startTimeout = (): void => {
            let registeredTimeout = setTimeout(() => {
                if (timeoutAction === 'failure') {
                    reject(new TimeoutError(`Promise timed out after ${timeout} milliseconds`));
                } else if (timeoutAction === 'success') {
                    resolve(undefined!);
                }
            }, timeout);
            unsubscribers.push(() => {
                clearTimeout(registeredTimeout);
            });
        };

        let [hasState, stateEvent] = events[timeoutMinimumState](client);

        if (hasState) { // e.g. is connected/is ready
            startTimeout();
        } else {
            // e.g. onConnect/onReady
            unsubscribers.push(stateEvent!.sub(() => startTimeout()));
        }

        unsubscribers.push(client.onClose.sub(hadError => {
            reject(new Error(`Connection closed with error=${hadError}`));
        }));

        unsubscribers.push(client.onMessage.sub(msg => {
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
