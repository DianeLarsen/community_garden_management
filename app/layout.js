import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import TokenRefresher from "@/components/TokenRefresher";
import { BasicProvider } from "@/context/BasicContext";
import { Suspense } from "react";
import Footer from "@/components/Footer";
import Loading from "./loading";
import { useRouter } from 'next/router';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Community Garden Manager",
  description: "Track Plots in your Community Garden",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  const router = useRouter();
  const scriptNonce = router.query.scriptNonce;
  const styleNonce = router.query.styleNonce;
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Google+Sans:400,500,700|Google+Sans+Text:400&lang=en"
          nonce={styleNonce}
        />
      </head>
      <body className={inter.className}>
        <BasicProvider>
          <header className="bg-gray-800 text-white">
            <NavBar />
          </header>
          <TokenRefresher />
          <Suspense fallback={<Loading />}>
            <main className="p-4">{children}
              
            </main>
          </Suspense>
          <Footer />
        </BasicProvider>
        <script nonce={scriptNonce} src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`} async defer></script>
      </body>
    </html>
  );
}
