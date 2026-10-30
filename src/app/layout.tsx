import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Onest } from 'next/font/google';
import '@/styles/tokens.css';
import '@/styles/globals.css';

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-onest',
});

export const metadata: Metadata = {
  title: 'Росток - интерактивные занятия',
  description: 'Интерактивные занятия для детей и подростков',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fff8ee',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru" className={onest.variable}>
      <body>{children}</body>
    </html>
  );
}