import {IRCMessage, MessageTypeDeclaration} from '../message';

export class ReconnectMessage {
    public constructor(private ircMessage: IRCMessage) {
    };

    public static get typeDescription(): MessageTypeDeclaration<ReconnectMessage> {
        return {
            command: 'RECONNECT',
            construct(ircMessage: IRCMessage): ReconnectMessage {
                return new ReconnectMessage(ircMessage);
            }
        };
    }
}
