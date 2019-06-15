import { Counter, Gauge, labelValues, Registry } from 'prom-client';
import { Client, ClientState } from '../client';
import { commandClassMap } from '../message/twitch-types';

export class ClientMetrics extends Registry {
    private client: Client;
    private metricsPrefix: string;

    public constructor(client: Client,
                       metricsPrefix: string = 'dank_twitch_irc_',
                       defaultLabels: labelValues = {}) {
        super();

        this.client = client;
        this.metricsPrefix = metricsPrefix;
        this.setDefaultLabels(defaultLabels);

        this.initializeConnectionsGauge();
        this.initializeMessageCounter();
        this.initializeChannelsCounter();
    }

    private initializeConnectionsGauge(): void {
        let labelNames = Object.keys(ClientState).filter(key => isNaN(parseInt(key))).map(s => s.toLowerCase());
        let gauge = new Gauge({
            name: this.metricsPrefix + 'connections',
            help: 'Number of connections',
            registers: [this],
            labelNames: labelNames
        });

        for (let labelName of labelNames) {
            gauge.set({ [labelName]: 1 }, 0);
        }

        let labelNameForState = (state: ClientState): string => {
            return ClientState[state].toLowerCase();
        };

        this.client.onNewConnection.sub(conn => {
            gauge.inc({ [labelNameForState(ClientState.UNCONNECTED)]: 1 });
            let updateState = ({ oldState, newState }): void => {
                gauge.dec({ [labelNameForState(oldState)]: 1 });
                if (newState < ClientState.CLOSED) {
                    gauge.inc({ [labelNameForState(newState)]: 1 });
                }
            };
            conn.onStateChange.sub(updateState);
        });
    }

    private initializeMessageCounter(): void {
        let knownCommands = Object.keys(commandClassMap);

        let counter = new Counter({
            name: this.metricsPrefix + 'messages_received',
            help: 'Messages received',
            registers: [this],
            labelNames: knownCommands
        });

        this.client.onMessage.sub(msg => {
            counter.inc({ [msg.ircCommand]: 1 });
        });
    }

    private initializeChannelsCounter(): void {
        let gauge = new Gauge({
            name: this.metricsPrefix + 'channels',
            help: 'Joined channels',
            registers: [this],
        });

        this.client.onJoin.sub(() => gauge.inc());
        this.client.onPart.sub(() => gauge.dec());
    }
}
