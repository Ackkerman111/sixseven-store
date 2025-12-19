// app/layout.js
import "./globals.css";
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "Six Seven Store | Premium Streetwear",
  description: "Discover premium streetwear and minimalist fashion collections",
  keywords: "streetwear, fashion, clothing, minimalist, premium",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className={inter.className}>
        <div className="app-root">
          {children}
        </div>
      </body>
    </html>
  );
}