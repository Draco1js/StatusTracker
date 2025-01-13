import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = minutes / 60;

    if (hours > 250) return `${Math.floor(hours)} hours`;
    if (hours >= 2) return `${hours.toFixed(1)} hours`;
    if (minutes >= 2) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    if (seconds > 0) return `${seconds} second${seconds > 1 ? 's' : ''}`;
    return '0 seconds';
}
