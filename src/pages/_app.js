import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import "@/styles/globals.css";
import { AnimatePresence } from "framer-motion";
import { Montserrat, Josefin_Sans, Inter, JetBrains_Mono, Lora, Fira_Code } from "next/font/google";
import Head from "next/head";
import { useRouter } from "next/router";

const montSerrat = Montserrat({
  subsets: ["cyrillic"],
  weights: [400, 500, 600, 700],
});

const josefinSans = Josefin_Sans({
  subsets: ["vietnamese"],
  weights: [400, 500, 600, 700],
});

export const poppins = Fira_Code({
  subsets: ['latin'],
  weight: [ "300", "400", "500", "600", "700"],
})
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
        <link rel="icon" href="/Sifat.png"/>
      </Head>
      <main
        className={`${lora.className}  bg-gradient-to-r from-[#b9b4e9] via-[#b191f1] to-[#f1a5fd] dark:bg-gradient-to-r dark:from-[#191919] dark:via-[#040304] dark:to-[#000000] w-full min-h-screen`}
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
