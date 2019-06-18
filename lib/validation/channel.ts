import { ValidationError } from './validation-error';

const channelNameRegex =
    /^[a-z0-9_]{1,25}$|^chatrooms:\d{0,20}:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}$/i;

export function validateIRCCommand(command: string): void {
    if (command.includes('\n') || command.includes('\r')) {
        throw new Error('IRC command may not include \\n or \\r!');
    }
}

export function validateChannelName(input: string): void {
    if (!(channelNameRegex.test(input))) {
        throw new ValidationError(`Channel name \"${input}\" is malformed`);
    }
}

