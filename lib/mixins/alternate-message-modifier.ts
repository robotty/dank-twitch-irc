import { ChatClient } from "../client/client";
import { PrivmsgMessage } from "../message/twitch-types/privmsg";
import { applyReplacements } from "../utils/apply-function-replacements";
import { ClientMixin } from "./base-mixin";

export const invisibleSuffix = " \u{000e0000}";

export class AlternateMessageModifier implements ClientMixin {
  private readonly client: ChatClient;
  private readonly lastMessages: Record<string, string> = {};

  public constructor(client: ChatClient) {
    this.client = client;
  }

  public appendInvisibleCharacter(
    channelName: string,
    newMessage: string
  ): string {
    const lastMessage: string | undefined = this.lastMessages[channelName];
    if (lastMessage === newMessage) {
      return newMessage + invisibleSuffix;
    } else {
      return newMessage;
    }
  }

  public applyToClient(client: ChatClient): void {
    applyReplacements(this, client, {
      async say(oldFn, channelName: string, message: string): Promise<void> {
        const newMsg = this.appendInvisibleCharacter(channelName, message);
        await oldFn(channelName, newMsg);

        if (!this.client.joinedChannels.has(channelName)) {
          // in this case we won't get our own message back via the
          // onPrivmsg handler, so this will have to do. (Save the sent
          // message)
          this.lastMessages[channelName] = newMsg;
        }
      },
      async me(oldFn, channelName: string, message: string): Promise<void> {
        const newMsg = this.appendInvisibleCharacter(channelName, message);
        await oldFn(channelName, newMsg);

        if (!this.client.joinedChannels.has(channelName)) {
          // in this case we won't get our own message back via the
          // onPrivmsg handler, so this will have to do. (Save the sent
          // message)
          this.lastMessages[channelName] = `\u0001ACTION ${newMsg}\u0001`;
        }
      }
    });

    client.on("PRIVMSG", this.onPrivmsgMessage.bind(this));
  }

  private onPrivmsgMessage(message: PrivmsgMessage): void {
    // msg must be from us (the logged in user)
    if (!(message.senderUsername === this.client.configuration.username)) {
      return;
    }

    this.lastMessages[message.channelName] = message.messageText;
  }
}
