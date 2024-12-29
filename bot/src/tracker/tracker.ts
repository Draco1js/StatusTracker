import { Shard } from '../aetherial/src';
import User from '../schemas/User';
import Activity from '../schemas/Activity';
import signale from 'signale';
import xfc_alias from '../utils/alias';

export async function track(client: Shard) {
    console.log('Tracking...');

    if((client.wss as WebSocket).readyState === 0x3) {
        console.log('WS connection closed, aborting tracking.');
        return;
    }

    const bulkUserUpdates = [];
    const bulkActivityUpdates = [];
    const activityCache = new Map();

    for (let presence of client.presences.values()) {
        if (!presence.activities.length) continue; // skip if no activities

        for (let activity of presence.activities) {
            if (activity.type === 6) continue; // weird new "chilling" activity etc.
            if (activity.type === 3) continue; // watching -> doesn't have a activity.start_date
            if (activity.type === 4) continue; // custom status
            if (activity.id === "ec0b28a579ecb4bd") continue; // this random id is apparently the bot status
            if ((activity as any).application_id === "307998818547531777" && !activity?.timestamps?.start) continue; // Medal.tv

            let activityName = xfc_alias(activity.name);

            if (!activity.timestamps?.start) {
                console.log("WARN -> No start time for activity:");
                console.log(activityName, ' -> ', (activity as any).application_id);
                continue;
            }

            const cacheKey = `${presence.user.id}-${activityName}`;
            let act = activityCache.get(cacheKey);

            if (!act) {
                act = await Activity.findOne({
                    id: presence.user.id,
                    name: activityName,
                });

                if (!act) {
                    act = {
                        id: presence.user.id,
                        name: activityName,
                        duration: 0,
                        last_tracked: 0,
                        timesPlayed: 1,
                        currentActivityStartTimestamp: 0,
                        new: true // Flag to indicate new activity
                    };
                }

                activityCache.set(cacheKey, act);
            }

            let duration = Date.now() - activity.timestamps.start;
            if (activity.timestamps.start < act.last_tracked) {
                duration = Date.now() - act.last_tracked;
            }

            if (act.new) {
                bulkActivityUpdates.push({
                    insertOne: {
                        document: {
                            id: presence.user.id,
                            name: activityName,
                            duration,
                            last_tracked: Date.now(),
                            currentActivityStartTimestamp: activity.timestamps.start,
                            timesPlayed: 1,
                        }
                    }
                });

                bulkUserUpdates.push({
                    updateOne: {
                        filter: { _id: presence.user.id },
                        update: { $push: { activities: act._id } },
                        upsert: true
                    }
                });
            } else {

                let upstream = { $inc: { duration } as UpstreamInc, $set: { last_tracked: Date.now() } as UpstreamSet }

                // same session
                if(act.currentActivityStartTimestamp != activity.timestamps.start) {
                    upstream.$inc.timesPlayed++;
                }

                if(!act.timestamps) console.log(`NO_TIMESTAMP`, act);
                console.log({ presence: JSON.stringify(presence), activity: JSON.stringify(activity), act: JSON.stringify(act) });
                upstream.$set.currentActivityStartTimestamp = act.timestamps.start;

                bulkActivityUpdates.push({
                    updateOne: {
                        filter: { id: presence.user.id, name: activityName },
                        update: upstream
                    }
                });
            }
        }
    }

    if (bulkUserUpdates.length) {
        signale.info(`[BulkWrite] Found ${bulkUserUpdates.length} updates for st/Users`);
        let t1 = Date.now();
        await User.bulkWrite(bulkUserUpdates);
        signale.info(`[BulkWrite] Completed in ${Date.now() - t1}ms`);
    }

    if (bulkActivityUpdates.length) {
        signale.info(`[BulkWrite] Found ${bulkActivityUpdates.length} updates for st/Activities`);
        let t1 = Date.now();
        await Activity.bulkWrite(bulkActivityUpdates);
        signale.info(`[BulkWrite] Completed in ${Date.now() - t1}ms`);
    }

    console.log('Tracking complete.');
}

interface UpstreamInc {
    duration: number;
    timesPlayed?: number;
}

interface UpstreamSet {
    last_tracked: number;
    currentActivityStartTimestamp?: number;
}