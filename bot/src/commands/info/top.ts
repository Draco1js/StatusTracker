import { Command, MessageEmbed } from '../../aetherial/src';
import Activity from '../../schemas/Activity';
import convertMs from '../../utils/convertMs';
import activityView from '../../views/activity';

export default {
    name: 'top',
    description: 'Shows your top activities',
    async run({ interaction }) {
        let id = interaction.data.member.user.id; // pov: didn't code this in the lib yet

        let activities = await Activity.find({ id })
            .sort({ duration: -1 })
            .limit(10);

        if (!activities.length) {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(0xed4245)
                        .setDescription('You have no activities tracked yet!')
                        .setFooter({
                            text: 'Start tracking your activities by using the `/track` command',
                        }),
                ],
            });
        }

        let totalDuration = activities.reduce(
            (acc, curr) => acc + curr.duration,
            0
        );

        let embed = new MessageEmbed()
            .setColor(0x2f3136)
            .setTitle('Top Activities')
            .setDescription(
                `You've played for ${convertMs(
                    totalDuration
                )} in total\nHere are your top activities:`
            )
            .setTimestamp(Date.now())
            .setFooter({
                text: `You can stop tracking your activities by using the /deactivate command at any time`,
            });

        for (let activity of activities) {
            let view = activityView(activity);
            embed.addField(view[0], view[1]);
        }

        return interaction.reply({ embeds: [embed] });
    },
} as Command;
