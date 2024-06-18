import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import AuthLinks from "@/components/AuthLinks";
import { IoMdMenu } from "react-icons/io";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Community Garden Manager",
  description: "Track Plots in your Community Garden",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-gray-800 text-white py-2">
          <nav className="flex items-center justify-between w-[92%] mx-auto">
            <div className="container mx-auto flex justify-between items-center">
              <Link
                href="/"
                className="hidden md:hidden lg:flex text-white lg:text-2xl font-bold"
              >
                Community Garden Management
              </Link>
              <Link
                href="/"
                title="Community Garden Management"
                className="lg:hidden text-white text-2xl font-bold"
              >
                CGM
              </Link>
            </div>
            <div className="md:static absolute md:min-h-fit min-h-[60vh] md:left-0 top-[9%] md:w-auto w-full flex items-center px-6">
              <ul className="flex md:flex-row flex-col md:items-center md:gap=[4vw] gap-7">
                <li>
                  <Link href="/" className="text-white px-4">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/plot-reservation" className="text-white px-4">
                    Plot Reservation
                  </Link>
                </li>
                <li>
                  <Link href="/event-calendar" className="text-white px-4">
                    Event Calendar
                  </Link>
                </li>
                <li>
                  <Link href="/weather-updates" className="text-white px-4">
                    Weather Updates
                  </Link>
                </li>
                <li>
                  <Link href="/community-gardens" className="text-white px-4">
                    Community Gardens
                  </Link>
                </li>
                <li>
                  <Link href="/groups" className="text-white px-4">
                    Groups
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
          <div>
            <AuthLinks />
            <IoMdMenu />
          </div>
        </header>

        <main className="p-4">{children}</main>
        <footer className="bg-blue-600 text-white p-4 text-center">
          &copy; 2024 Community Garden
        </footer>
      </body>
    </html>
  );
}
