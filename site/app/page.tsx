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

        try {
            const [data, globalStats] = await Promise.all([
                getData(user ? user.externalAccounts[0].externalId : null),
                getGlobalStats(),
            ]);

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
            console.error('Error fetching data:', error);

            return (
                <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-[#7338A0] to-[#0F0529] animate-gradient-x">
                    <div className="bg-white p-8 rounded-lg shadow-xl">
                        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                            Oops! Something went wrong
                        </h1>
                        <p className="mb-6 text-center text-gray-600">
                            Failed to fetch remote data
                        </p>
                    </div>
                </main>
            );
        }
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
