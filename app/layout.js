import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";

import TokenRefresher from "@/components/TokenRefresher";
import { BasicProvider } from "@/context/BasicContext";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Loading from "./loading";

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
      <BasicProvider>
        <link rel="icon" href="/public/favicon.ico" sizes="any" />
        <header className="bg-gray-800 text-white ">
          <NavBar />
        </header>
        <TokenRefresher />
        <Suspense fallback={<Loading />}>
        <main className="p-4 ">{children}</main>
        </Suspense>
        <Footer />
        </BasicProvider>
      </body>
    </html>
  );
}
