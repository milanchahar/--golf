import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Golf Heroes — Play, Win, Give",
  description: "Subscribe monthly, enter your scores, and compete in monthly prize draws — while supporting a charity you care about.",
  openGraph: {
    title: 'Golf Heroes — Play, Win, Give',
    description: 'Subscribe monthly, enter your scores, and compete in monthly prize draws — while supporting a charity you care about.',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-blue-600 selection:text-white`}>
        {children}
        <Toaster position="bottom-right" toastOptions={{ 
           style: { background: '#1E293B', color: '#fff', border: '1px solid rgba(148, 163, 184, 0.2)' },
           success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
           error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } }
        }} />
      </body>
    </html>
  );
}
