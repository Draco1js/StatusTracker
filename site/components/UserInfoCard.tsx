import { User } from '@clerk/nextjs/server';
import { User as ApiUser } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import {
    SignedIn,
    SignedOut,
    SignInButton,
    SignOutButton,
} from '@clerk/nextjs';

interface UserInfoCardProps {
    user: User | null;
    apiUser: ApiUser | null;
}

export default function UserInfoCard({ user, apiUser }: UserInfoCardProps) {
    return (
        <Card className="bg-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-x-4 pb-2">
                <div className="flex flex-row items-center space-x-4">
                    <Image
                        src={
                            user
                                ? user.externalAccounts[0].imageUrl
                                : 'https://cdn.discordapp.com/attachments/1241422268362653797/1326916099106799637/purple-color-palettes.png?ex=6781d32a&is=678081aa&hm=23e8c609c2a12275afdc25d87c64ce7d41d8a4f7c62851be1e0cd83c1cc3cacd&'
                        }
                        alt="Profile Image"
                        width={80}
                        height={80}
                        className="rounded-full border-4 border-indigo-500"
                    />
                    <div>
                        <CardTitle className="text-2xl font-bold text-gray-800">
                            Welcome,{' '}
                            {user
                                ? user.externalAccounts[0].firstName
                                : "You're not logged in"}
                            !
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                            Discord ID:{' '}
                            {user ? user.externalAccounts[0].externalId : '-'}
                        </p>
                    </div>
                </div>
                <SignedIn>
                    <SignOutButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode={"modal"}/>
                </SignedOut>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-indigo-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-indigo-800">
                            User ID
                        </p>
                        <p className="text-lg text-indigo-600">
                            {apiUser ? apiUser._id : '-'}
                        </p>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-purple-800">
                            Joined
                        </p>
                        <p className="text-lg text-purple-600">
                            {apiUser
                                ? new Date(apiUser.joined).toLocaleDateString()
                                : '-'}
                        </p>
                    </div>
                    <div className="bg-pink-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-pink-800">
                            Tracking
                        </p>
                        <p className="text-lg text-pink-600">
                            {apiUser
                                ? apiUser.tracking
                                    ? 'Active'
                                    : 'Inactive'
                                : '-'}
                        </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800">
                            Activities
                        </p>
                        <p className="text-lg text-blue-600">
                            {apiUser ? apiUser.activities.length : '-'}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
