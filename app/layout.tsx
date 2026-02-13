import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "SFBBO Inventory Tracker",
  description: "Track inventory items, reservations, and events for SFBBO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="app-shell">
          <Navigation />
          <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
