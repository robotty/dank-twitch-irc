import { ChatClient } from "../client/client";
import { PrivmsgMessage } from "../message/twitch-types/privmsg";
import { applyReplacements } from "../utils/apply-function-replacements";
import { ClientMixin } from "./base-mixin";
import { canSpamFast } from "./ratelimiters/utils";

export const invisibleSuffix = " \u{000e0000}";

interface LastMessage {
  messageText: string;
  action: boolean;
}

export class AlternateMessageModifier implements ClientMixin {
  private readonly client: ChatClient;
  private readonly lastMessages: Record<string, LastMessage> = {};

  public constructor(client: ChatClient) {
    this.client = client;
  }

  public appendInvisibleCharacter(
    channelName: string,
    messageText: string,
    action: boolean
  ): string {
    const lastMessage: LastMessage | undefined = this.lastMessages[channelName];

    if (
      lastMessage != null &&
      lastMessage.messageText === messageText &&
      lastMessage.action === action
    ) {
      return messageText + invisibleSuffix;
    } else {
      return messageText;
    }
  }

  public applyToClient(client: ChatClient): void {
    type GenericReplacementFn = (
      oldFn: (channelName: string, message: string) => Promise<void>,
      channelName: string,
      message: string
    ) => Promise<void>;

    const genericReplament = (action: boolean): GenericReplacementFn => async (
      oldFn: (channelName: string, message: string) => Promise<void>,
      channelName: string,
      message: string
    ): Promise<void> => {
      const { fastSpam } = canSpamFast(
        channelName,
        client.configuration.username,
        client.userStateTracker
      );

      if (fastSpam) {
        await oldFn(channelName, message);
        return;
      }

      const newMsg = this.appendInvisibleCharacter(
        channelName,
        message,
        action
      );
      await oldFn(channelName, newMsg);

      if (!this.client.joinedChannels.has(channelName)) {
        // in this case we won't get our own message back via the
        // onPrivmsg handler, so this will have to do. (Save the sent
        // message)
        this.lastMessages[channelName] = {
          messageText: newMsg,
          action
        };
      }
    };

    applyReplacements(this, client, {
      say: genericReplament(false),
      me: genericReplament(true)
    });

    client.on("PRIVMSG", this.onPrivmsgMessage.bind(this));
  }

  private onPrivmsgMessage(message: PrivmsgMessage): void {
    // msg must be from us (the logged in user)
    if (!(message.senderUsername === this.client.configuration.username)) {
      return;
    }

    this.lastMessages[message.channelName] = {
      messageText: message.messageText,
      action: message.isAction
    };
  }
}
