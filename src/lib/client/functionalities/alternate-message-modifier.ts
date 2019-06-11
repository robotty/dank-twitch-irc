import { PrivmsgMessage } from '../../message/twitch-types';
import { setDefaults } from '../../utils';
import { ClientConfiguration, configDefaults } from '../config';
import { Client } from '../interface';

export const invisibleSuffix = ' \u{000e0000}';

export class AlternateMessageModifier {

    private lastMessages: Map<string, PrivmsgMessage> = new Map<string, PrivmsgMessage>();
    private configuration: ClientConfiguration;

    public constructor(partialConfig: Partial<ClientConfiguration>) {
        this.configuration = setDefaults(partialConfig, configDefaults);
    }

    public appendInvisibleCharacter(channelName: string, message: string): string {
        let lastPrivmsgMessage = this.lastMessages.get(channelName);
        if (lastPrivmsgMessage != null && lastPrivmsgMessage.message === message) {
            return message + invisibleSuffix;
        }

        return message;
    }

    private onPrivmsgMessage(message: PrivmsgMessage): void {
        if (!(message.senderUsername === this.configuration.username)) {
            return;
        }

        this.lastMessages.set(message.channelName, message);
    }

    public registerListenersOn(client: Client): void {
        client.subscribe('PRIVMSG', this.onPrivmsgMessage.bind(this));
    }

}
