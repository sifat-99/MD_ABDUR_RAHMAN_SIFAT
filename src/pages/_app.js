/* eslint-disable @next/next/next-script-for-ga */
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import { AnimatePresence } from "framer-motion";
import {
    Lora,
} from "next/font/google";
import Head from "next/head";
import Script from "next/script";
import { useRouter } from "next/router";


const lora = Lora({
    subsets: ["latin"],
    weights: [400, 500, 600, 700],
});

export default function App({ Component, pageProps }) {
    const router = useRouter();
    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/Sifat.svg" />
            </Head>
            <Script
                strategy="afterInteractive"
                src="https://www.googletagmanager.com/gtag/js?id=G-RD0TN8SP2K"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-RD0TN8SP2K');
        `}
            </Script>
            <main
                className={`${lora.className} bg-gradient-to-r from-[#b9b4e9] via-[#b191f1] to-[#f1a5fd] dark:bg-gradient-to-r dark:from-[#191919] dark:via-[#040304] dark:to-[#000000] w-full min-h-screen animate-gradient bg-[length:400%_400%]`}
            >
                <Navbar />
                <AnimatePresence mode="wait">
                    <Component key={router.asPath} {...pageProps} />
                </AnimatePresence>
                <Footer />
            </main>
        </>
    );
}
