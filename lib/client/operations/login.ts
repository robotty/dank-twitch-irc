import { awaitResponse } from '../../await/await-response';
import { commandIs } from '../../await/conditions';
import { SingleConnection } from '../connection';
import { ClientError } from '../errors';

export class LoginError extends ClientError {
    public constructor(message: string, cause?: Error | undefined) {
        super(message, cause);
    }
}

export async function sendLogin(conn: SingleConnection, username: string,
                                password?: string): Promise<void> {
    if (password != null) {
        conn.send(`PASS ${password}`);
    }
    conn.send(`NICK ${username}`);

    // successful login if we're greeted with a 001,
    // e.g. :tmi.twitch.tv 001 justinfan12345 :Welcome, GLHF!
    // some kind of error occurred if the server sends us a NOTICE.
    // e.g. :tmi.twitch.tv NOTICE * :Improperly formatted auth
    // or :tmi.twitch.tv NOTICE * :Login authentication failed
    await awaitResponse(conn, {
        success: commandIs('001'),
        failure: commandIs('NOTICE'),
        errorType: (message, cause) => new LoginError(message, cause),
        errorMessage: 'Failed to login',
        timeoutMinimumState: 'connected'
    });

}
