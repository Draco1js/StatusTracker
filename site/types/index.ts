export interface Activity {
	duration: number;
	id: string;
	last_tracked: number;
	name: string;
	last_sessionID?: string;
	timesPlayed?: number;
}

export interface User {
	_id: string;
	activities: string[];
	joined: number;
	tracking: boolean;
}

export interface ApiResponse {
	activities: Activity[];
	user: User;
}

export interface GlobalActivity {
	_id: string;
	total_duration: number;
}

export interface GlobalStats {
	activities: GlobalActivity[];
}