import ActivityCharts from '@/components/ActivityCharts';
import ActivityList from '@/components/ActivityList';
import UserInfoCard from '@/components/UserInfoCard';
import GlobalStats from '@/components/GlobalStats';
import { ApiResponse, GlobalStats as GlobalStatsType } from '@/types';
import { SignInButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import axios from 'axios';

async function getData(userId: string | null): Promise<ApiResponse | null> {
    if (!userId) return null;
    const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/user/${userId}`
    );
    if (!res.data) {
        return null;
    }
    return res.data;
}

async function getGlobalStats(): Promise<GlobalStatsType> {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/global`);
    if (!res.data) {
        throw new Error('Failed to fetch global stats');
    }
    return res.data;
}

export default async function Home() {
    try {
        const user = await currentUser();
        const [data, globalStats] = await Promise.all([
            getData(user ? user.externalAccounts[0].externalId : null),
            getGlobalStats(),
        ]);

        // if (!user) {
        //     return (
        //         <main className="min-h-screen p-8 bg-gradient-to-br from-[#9E72C3] to-[#0F0529] animate-gradient-x">
        //             <div className="max-w-7xl mx-auto">
        //                 <div className="bg-white p-8 rounded-lg shadow-xl mb-8">
        //                     <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        //                         Welcome to Activity Tracker
        //                     </h1>
        //                     <p className="mb-6 text-center text-gray-600">
        //                         Please sign in to view your personal dashboard
        //                     </p>
        //                     <SignInButton mode="modal">
        //                         <div className="flex justify-center items-center">
        //                             <Button
        //                                 size={'lg'}
        //                                 className="bg-[#924DBF] p-7 text-lg"
        //                             >
        //                                 Sign In
        //                             </Button>
        //                         </div>
        //                     </SignInButton>
        //                 </div>
        //                 <GlobalStats activities={globalStats.activities} />
        //             </div>
        //         </main>
        //     );
        // }

        return (
            <main className="min-h-screen p-8 bg-gradient-to-br from-[#7338A0] to-[#0F0529] animate-gradient-x">
                <div className="max-w-7xl mx-auto">
                    <UserInfoCard
                        user={user}
                        apiUser={data ? data.user : null}
                    />
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ActivityList
                            activities={data ? data.activities : null}
                        />
                        <ActivityCharts
                            activities={data ? data.activities : null}
                        />
                    </div>
                    <GlobalStats activities={globalStats.activities} />
                </div>
            </main>
        );
    } catch (error) {
        console.error('Error fetching user:', error);
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-[#7338A0] to-[#0F0529] animate-gradient-x">
                <div className="bg-white p-8 rounded-lg shadow-xl">
                    <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                        Oops! Something went wrong
                    </h1>
                    <p className="mb-6 text-center text-gray-600">
                        Please try signing in again
                    </p>
                    <SignInButton mode="modal">
                        <button className="w-full bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-300">
                            Sign In
                        </button>
                    </SignInButton>
                </div>
            </main>
        );
    }
}
