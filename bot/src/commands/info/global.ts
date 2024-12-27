import { Command, MessageEmbed } from '../../aetherial/src';
import Activity from '../../schemas/Activity';
import activityView from '../../views/activity';

export default {
    name: 'global',
    description: 'Shows global top played activities',
    async run({ interaction }) {
        let activities = await Activity.aggregate([
            {
                $group: {
                    _id: "$name",
                    duration: { $sum: "$duration" }
                }
            },
            {
                $sort: { totalDuration: -1 }
            },
            {
                $limit: 15
            }
        ])

        if (!activities.length) {
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(0xed4245)
                        .setDescription('Failed to get the global leaderboard'),
                ],
            });
        }

        let embed = new MessageEmbed()
            .setColor(0x2f3136)
            .setTitle('Top Activities')
            .setDescription('Top played Activities on StatusTracker')
            .setTimestamp(Date.now());

        for (let activityAgg of activities) {
            let activity = { name: activityAgg._id, duration: activityAgg.totalDuration }
            let view = activityView(activity)
            embed.addField(view[0], view[1]);
        }

        return interaction.reply({ embeds: [embed] });
    },
} as Command;
