import { ChannelMessage, Message } from '../message/message';
import { NoticeMessage, PongMessage } from '../message/twitch-types';
import { TwitchMessagePrototype } from '../messageemitter';
import { TwitchMessage } from '../message/twitch';

export interface Condition {
    (message: Message): boolean;
}

interface FluidCondition extends Condition {
    and(another: FluidCondition): FluidCondition;

    or(another: FluidCondition): FluidCondition;

    invert(): FluidCondition;

    not(): FluidCondition;
}

export function fluid(condition: Condition): FluidCondition {
    let fCond = condition as FluidCondition;
    fCond.and = function and(another: Condition): FluidCondition {
        return fluid(e => this(e) && another(e));
    };

    fCond.or = function or(another: Condition): FluidCondition {
        return fluid(e => this(e) || another(e));
    };

    fCond.invert = function invert() {
        return fluid(e => !this(e));
    };
    fCond.not = fCond.invert;

    return fCond;
}

export function commandIs(command: string): FluidCondition {
    return fluid(e => {
        return e.ircCommand === command;
    });
}

export function commandsAre(...commands: string[]): FluidCondition {
    return fluid(e => {
        return commands.includes(e.ircCommand);
    });
}

export function channelIs(channelName: string): FluidCondition {
    return fluid(e => 'channelName' in e && (e as ChannelMessage).channelName === channelName);
}

export function channelsAre(...channels: string[]): FluidCondition {
    return fluid(e => 'channelName' in e && channels.includes((e as ChannelMessage).channelName));
}

export function typeIs<T extends TwitchMessage>(prototype: TwitchMessagePrototype<T>): FluidCondition {
    return fluid(e => e instanceof prototype);
}

export function typesAre<T extends TwitchMessage>(prototypes: TwitchMessagePrototype<T>[]): FluidCondition {
    return fluid(e => prototypes.find(prototype => e instanceof prototype) != null);
}

export function isPongTo(sentPingArgument: string): FluidCondition {
    return fluid(e => e instanceof PongMessage && (e as PongMessage).argument === sentPingArgument);
}

export function noticesWithIDs(...ids: string[]): FluidCondition {
    return fluid(e => e instanceof NoticeMessage && ids.includes((e as NoticeMessage).messageID));
}

export function nicknameIs(nickname: string): FluidCondition {
    return fluid(e => e.ircNickname === nickname);
}

export const alwaysFalse: FluidCondition = fluid(() => false);
const alwaysTrue: FluidCondition = fluid(() => true);
