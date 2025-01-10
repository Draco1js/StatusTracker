import { Activity } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { formatDuration } from '@/lib/utils';
import Image from 'next/image';
import imp from '@/lib/emojis.json';
const emojis: { [key: string]: string } = imp;

interface ActivityListProps {
    activities: Activity[] | null;
}

// https://cdn.discordapp.com/emojis/757181674093150278.webp?size=240

export default function ActivityList({ activities }: ActivityListProps) {
    return (
        <Card className="bg-white shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-800">
                    Recent Activities
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Name</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Last Tracked</TableHead>
                            <TableHead>Times Played</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities ? (
                            activities.map((activity) => (
                                <TableRow key={activity.id + activity.name}>
                                    <TableCell className="font-medium flex flex-row items-center">
                                        {emojis[activity.name] && (
                                            <Image
                                                alt={activity.name}
                                                width={20}
                                                height={20}
                                                src={`https://cdn.discordapp.com/emojis/${
                                                    emojis[activity.name]
                                                }.webp?size=240`}
                                                className="mr-1"
                                            />
                                        )}
                                        {activity.name}
                                    </TableCell>
                                    <TableCell>
                                        {formatDuration(activity.duration)}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(
                                            activity.last_tracked
                                        ).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: '2-digit',
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        {activity.timesPlayed || 'N/A'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No activities found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}