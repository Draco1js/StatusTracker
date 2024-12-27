import './instrument';
import { loadCommands, Shard } from './aetherial/src';
import config from '../config.json';
import { track } from './tracker/tracker';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node'

process.env.NODE_ENV = 'development';

const client = new Shard();

client.on('shardReady', (shard) => {
    console.log(`Shard ${shard[0]} is ready!`);

    setInterval(() => {
        track(client);
    }, 1000 * 60 * 2);
});

loadCommands(client.client.commands);

// command handler
client.on('interactionCreate', (interaction) => {
    Sentry.profiler.startProfiler();
    //if (!interaction.isCommand()) return; // this is not in the aetherial library yet

    const command = client.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
        command.run({ interaction });
    } catch (error) {
        console.error(error);
        interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        });
    }

    Sentry.profiler.stopProfiler();
});

mongoose.connect(config.mongo);

client.login(config.token);
