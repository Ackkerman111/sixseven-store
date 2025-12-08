// app/layout.js
import "./globals.css";

export const metadata = {
  title: "Six Seven Clothing",
  description: "Simple clothing store with Supabase + Next.js"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="app-root">{children}</div>
      </body>
    </html>
  );
}