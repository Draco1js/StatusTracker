import { User } from '@clerk/nextjs/server';
import { User as ApiUser } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

interface UserInfoCardProps {
    user: User;
    apiUser: ApiUser;
}

export default function UserInfoCard({ user, apiUser }: UserInfoCardProps) {
    return (
        <Card className="bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <Image
                    src={user.externalAccounts[0].imageUrl}
                    alt="Profile Image"
                    width={80}
                    height={80}
                    className="rounded-full border-4 border-indigo-500"
                />
                <div>
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Welcome, {user.externalAccounts[0].firstName}!
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                        Discord ID: {user.externalAccounts[0].externalId}
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-indigo-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-indigo-800">
                            User ID
                        </p>
                        <p className="text-lg text-indigo-600">{apiUser._id}</p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-purple-800">
                            Joined
                        </p>
                        <p className="text-lg text-purple-600">
                            {new Date(apiUser.joined).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="bg-pink-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-pink-800">
                            Tracking
                        </p>
                        <p className="text-lg text-pink-600">
                            {apiUser.tracking ? 'Active' : 'Inactive'}
                        </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800">
                            Activities
                        </p>
                        <p className="text-lg text-blue-600">
                            {apiUser.activities.length}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
