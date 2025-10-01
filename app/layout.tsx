import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OMR Web Scanner - Fast & Accurate',
  description:
    'Upload and process OMR sheets online with high accuracy and speed. Built with Next.js for optimal performance.',
  keywords: [
    'OMR',
    'Optical Mark Recognition',
    'Scanner',
    'Exam',
    'Assessment',
    'Next.js'
  ],
  authors: [{ name: 'OMR Scanner Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'OMR Web Scanner',
    description: 'Fast and accurate OMR sheet processing online',
    type: 'website',
    locale: 'en_US'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OMR Web Scanner',
    description: 'Fast and accurate OMR sheet processing online'
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <div className="min-h-full">{children}</div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff'
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff'
              }
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff'
              }
            }
          }}
        />
      </body>
    </html>
  );
}
