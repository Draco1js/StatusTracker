import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import { Inter } from 'next/font/google';
import { shadesOfPurple } from "@clerk/themes"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Status Tracker | User Activity Dashboard',
  description: 'Status go brrrrr....',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClerkProvider appearance={{
          baseTheme: shadesOfPurple,
          layout: {
            unsafe_disableDevelopmentModeWarnings: true,
          }
        }}>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}

