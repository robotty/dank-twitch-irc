import { validateChannelName } from '../../validation';
import { IClient } from '../interface';

export function sendPrivmsg(client: IClient, channelName: string, message: string): void {
    validateChannelName(channelName);
    client.send(`PRIVMSG #${channelName} :${message}`);
}
