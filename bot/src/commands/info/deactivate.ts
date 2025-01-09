import { MessageEmbed } from '../../aetherial/src';
import User from '../../schemas/User';

export default {
    name: `deactivate`,
    description: `Stop tracking your activities`,
    async run({ interaction }) {
        let state = await User.findOne({ id: interaction.user.id });
        if (state.tracking === null) {
            await User.updateOne(
                { id: interaction.user.id },
                { tracking: false }
            );
        }

        if (state.tracking === false) {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(0x924dbf)
                        .setDescription(`You are not tracking your activities`),
                ],
            });
        }

        await User.updateOne({ id: interaction.user.id }, { tracking: false });
        return interaction.reply({
            embeds: [
                new MessageEmbed()
                    .setColor(0x924dbf)
                    .setDescription(
                        `We have stopped tracking your activities, We will stop all data collection`
                    ),
            ],
        });
    },
};
