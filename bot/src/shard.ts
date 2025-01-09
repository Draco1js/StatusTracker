import './instrument';
import { loadCommands, Shard } from './aetherial/src';
import config from '../config.json';
import { track } from './tracker/tracker';
import mongoose from 'mongoose';
import * as Sentry from '@sentry/node';
import User from './schemas/User';

process.env.NODE_ENV = 'development';

const client = new Shard();

client.on('shardReady', (shard) => {
    console.log(`Shard ${shard[0]} is ready!`);

    // @ts-ignore
    //client.updatePresence({ status: 'online', name: 'Tracking Presences' });

    setInterval(() => {
        track(client);
    }, 1000 * 60 * 2);
});

loadCommands(client.client.commands);

// command handler
client.on('interactionCreate', async (interaction) => {
    Sentry.profiler.startProfiler();
    //if (!interaction.isCommand()) return; // this is not in the aetherial library yet

    const command = client.client.commands.get(interaction.commandName);

    if (!command) return;

    let user = await User.findOne({ _id: interaction.user.id });
    if (!user)
        user = await User.create({
            _id: interaction.user.id,
            tracking: false,
            joined: Date.now(),
        });

    try {
        interaction.user = { id: interaction.data.member.user.id };
        // @ts-ignore
        command.run({ interaction, client });
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
