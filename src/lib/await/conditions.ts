import { ChannelMessage, Message } from '../message/message';
import { NoticeMessage } from '../message/twitch-types';

export interface Condition {
    (message: Message): boolean;
}

export interface FluidCondition extends Condition {
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

export function noticesWithIDs(...ids: string[]): FluidCondition {
    return fluid(e => e instanceof NoticeMessage && ids.includes((e as NoticeMessage).messageID));
}

export function nicknameIs(nickname: string): FluidCondition {
    return fluid(e => e.ircNickname === nickname);
}

export const alwaysFalse: FluidCondition = fluid(() => false);
export const alwaysTrue: FluidCondition = fluid(() => true);
