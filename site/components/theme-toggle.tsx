'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains('dark');
        setIsDark(isDarkMode);
    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.toggle('dark');
        setIsDark(!isDark);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="fixed bottom-6 right-6 rounded-full w-16 h-16 bg-white/10 backdrop-blur-sm dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 transition-all duration-300"
            onClick={toggleTheme}
        >
            {isDark ? (
                <Sun className="h-8 w-8 text-yellow-500" />
            ) : (
                <Moon className="h-8 w-8 text-slate-700" />
            )}
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
