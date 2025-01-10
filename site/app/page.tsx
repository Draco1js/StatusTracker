import ActivityCharts from '@/components/ActivityCharts';
import ActivityList from '@/components/ActivityList';
import UserInfoCard from '@/components/UserInfoCard';
import { ApiResponse } from '@/types';
import { SignInButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import axios from 'axios';


async function getData(): Promise<ApiResponse> {
    const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE}/user/427435240093646849`
    );
    if (!res.data) {
        throw new Error('Failed to fetch data');
    }
    return res.data;
}

export default async function Home() {
    const data = await getData();

    try {
        const user = await currentUser();
        if (!user) {
            return (
                <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-[#9E72C3] to-[#0F0529] animate-gradient-x">
                    <div className="bg-white p-8 rounded-lg shadow-xl">
                        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                            Welcome to Activity Tracker
                        </h1>
                        <p className="mb-6 text-center text-gray-600">
                            Please sign in to view your dashboard
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

        return (
            <main className="min-h-screen p-8 bg-gradient-to-br from-[#7338A0] to-[#0F0529] animate-gradient-x">
                <div className="max-w-7xl mx-auto">
                    <UserInfoCard user={user} apiUser={data.user} />
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <ActivityList activities={data.activities} />
                        <ActivityCharts activities={data.activities} />
                    </div>
                </div>
            </main>
        );
    } catch (error) {
        console.error('Error fetching user:', error);
        return (
            <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-500 to-purple-600">
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
