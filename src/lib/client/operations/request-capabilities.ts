import { awaitResponse } from '../../await/await-response';
import { fluid, FluidCondition } from '../../await/conditions';
import { ConnectionError } from '../errors';
import { Client } from '../interface';

export class CapabilitiesError extends ConnectionError {
    public constructor(message: string, cause?: Error) {
        super(message, cause);
    }
}

function acknowledgesCapabilities(...capabilities: string[]): FluidCondition {
    return fluid(e => {
        if (e.ircCommand !== 'CAP') {
            return false;
        }

        if (e.ircParameters.length < 3) {
            return false;
        }

        if (e.ircParameters[1] !== 'ACK') {
            return false;
        }

        let acknowledgedParameters = e.trailingParameter.split(' ');
        // test that all capabilities are acknowledged
        return capabilities.every(cap => acknowledgedParameters.indexOf(cap) !== -1);
    });
}

function deniedAnyCapability(...capabilities: string[]): FluidCondition {
    return fluid(e => {
        if (e.ircCommand !== 'CAP') {
            return false;
        }

        if (e.ircParameters.length < 3) {
            return false;
        }

        if (e.ircParameters[1] !== 'NAK') {
            return false;
        }

        let deniedCapabilities = e.trailingParameter.split(' ');
        // if any of the denied capabilities are in the list, return true
        return deniedCapabilities.findIndex(cap => capabilities.indexOf(cap) !== -1) !== -1;
    });
}

export async function requestCapabilities(client: Client, requestMembershipCapability: boolean): Promise<void> {
    let capabilities = [
        'twitch.tv/commands',
        'twitch.tv/tags'
    ];
    if (requestMembershipCapability) {
        capabilities.push('twitch.tv/membership');
    }
    await client.send(`CAP REQ :${capabilities.join(' ')}`);

    // CAP ACK :twitch.tv/commands twitch.tv/tags twitch.tv/membership
    // CAP NAK :twitch.tv/invalid
    await awaitResponse(client, {
        success: acknowledgesCapabilities(...capabilities),
        failure: deniedAnyCapability(...capabilities),
        errorType: (message, cause) => new CapabilitiesError(message, cause),
        errorMessage: `Error requesting server capabilities ${capabilities.join(', ')}`,
        timeoutMinimumState: 'connected'
    });
}
