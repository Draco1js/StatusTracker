import { Command, MessageEmbed } from '../../aetherial/src';
import User from '../../schemas/User';

export default {
    name: `track`,
    description: `Start tracking your activities`,
    async run({ interaction }) {
        let state = await User.findOne({ id: interaction.user.id });
        if (state.tracking === null) {
            await User.updateOne(
                { id: interaction.user.id },
                { tracking: true }
            );
        }
        if (state.tracking === true) {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(0x924dbf)
                        .setDescription(
                            `You are already tracking your activities`
                        ),
                ],
            });
        }

        await User.updateOne({ id: interaction.user.id }, { tracking: true });

        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(0x924dbf)
                    .setDescription(
                        `You have successfully started tracking your activities`
                    ),
            ],
        });
    },
} as Command;
