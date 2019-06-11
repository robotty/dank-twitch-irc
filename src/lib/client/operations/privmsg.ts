import { validateChannelName } from '../../validation';
import { Client } from '../interface';

export function sendPrivmsg(client: Client, channelName: string, message: string): void {
    validateChannelName(channelName);
    client.send(`PRIVMSG #${channelName} :${message}`);
}
