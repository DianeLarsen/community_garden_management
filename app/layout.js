import { Inter } from "next/font/google";

import "./globals.css";

import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Community Garden Manager",
  description: "Track Plots in your Community Garden",
  icons: {
    icon: "/public/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <link rel="icon" href="/public/favicon.ico" sizes="any" />
        <header className="bg-gray-800 text-white py-2">
         <NavBar />
        </header>

        <main className="p-4">{children}</main>
        <footer className="bg-blue-600 text-white p-4 text-center">
  <p>&copy; 2024 Community Garden</p>
  <p>123 Garden Lane, Monroe, WA 98272</p>
  <p>Contact us at info@communitygarden.com | (425) 555-1234</p>
  <div className="flex justify-center space-x-4 mt-2">
    <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
    <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
    <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
  </div>
</footer>

      </body>
    </html>
  );
}
