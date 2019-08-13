/**
 * Maximum line length (including CR LF) the twitch server will accept before
 * chopping the rest off
 */
export const MAX_OUTGOING_LINE_LENGTH = 4096;

/**
 * Maximum command length (excluding CR LF) the twitch server will accept before
 * chopping the rest off
 */
export const MAX_OUTGOING_COMMAND_LENGTH = MAX_OUTGOING_LINE_LENGTH - 2;
