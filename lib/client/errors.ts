import { BaseError } from "../utils/base-error";
// tslint:disable:max-classes-per-file

/**
 * Indicates an error directly caused by some bad server message being received,
 * e.g. a msg_channel_suspended when trying to join a channel.
 */
export class MessageError extends BaseError {}

/**
 * Marks an error that mandates a disconnect of a single connection,
 * but must not necessarily mean that a multi-connection client as a whole must disconnect
 */
export class ConnectionError extends BaseError {}

/**
 * Marks an error that mandates a disconnect of a single connection
 * that was caused by a bad message (protocol error) being received from the server,
 * e.g. an unparseable IRC message or an invalid response to some action.
 */
export class ProtocolError extends ConnectionError {}

/**
 * Marks an error that mandates a disconnect of the whole client and all its connections,
 * e.g. a login error.
 */
export class ClientError extends ConnectionError {}
