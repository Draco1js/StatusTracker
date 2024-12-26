import convertMs from "../utils/convertMs";
import emojis from '../emojis.json';

export default function activityView(activity: Activity) {
    let emojiName = activity.name.normalize('NFC').replace(/ /gm, "").replace(/\-/gm, "")
    if (emojiName == "TomClancy'sRainbowSixSiege") emojiName = "RainbowSixSiege";
    let emojiId: string = (emojis as Emojis)[emojiName];
    let emoji = emojiId ? `<:${emojiName}:${emojiId}> ` : '';
    return [`${emoji}${activity.name}`, `Duration: ${convertMs(activity.duration)}`] as ActivityField;
}

interface Activity {
    name: string;
    id: string;
    duration: number;
    last_tracked: number;
}

type ActivityField = [string, string];

interface Emojis {
	[key: string]: string;
}