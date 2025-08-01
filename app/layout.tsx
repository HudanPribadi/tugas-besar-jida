// --- File: app/layout.tsx ---
import './globals.css';
import { Inter } from 'next/font/google';
import { SessionProviderWrapper } from '../components/SessionProviderWrapper';
import Header from '../components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Dynamic Form Editor',
  description: 'Create and manage forms like Google Forms.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container main-content">
              {children}
            </main>
          </div>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}