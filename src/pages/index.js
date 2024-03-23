import Head from "next/head";
import Layout from "@/components/Layout";
import profilePic from "/public/Dev.json";
import AnimatedText from "@/components/AnimatedText";
import Link from "next/link";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import HireMe from "@/components/HireMe";
import TransitionEffects from "@/components/TransitionEffects";
import Lottie from "lottie-react";
import useModalForContact from "@/components/Hooks/useModalForContact";

export default function Home() {
  const contact = useModalForContact()
  return (
    <>
      <Head>
        <title>MD: ABDUR RAHMAN SIFAT</title>
        <meta name="description" content="Created by sifat khan" />
      </Head>
      <TransitionEffects />
      <main className="flex items-center   text-dark w-full dark:text-white max-h-screen">
        <Layout className="pt-0 mb-10 bg-transparent dark:bg-transparent">
          <div className="flex items-center justify-between gap-6 w-full lg:flex-col">
            <div className="w-1/2 md:w-full">
              <Lottie
                className="w-full h-auto lg:hidden md:inline-block md:w-full"
                animationData={profilePic}
              />
            </div>
            <div className="w-1/2 flex-col items-center self-center text-left lg:w-full lg:text-center md:text-sm sm:text-xs">
              <AnimatedText
                text="MD: ABDUR RAHMAN SIFAT"
              
                className="!text-4xl !text-right xl:!text-3xl lg:!text-center lg:!text-4xl md:!text-3xl sm:!text-2xl "
              />
              <AnimatedText
                text="Turning Vision Into Reality With Code And Design."
                className="!text-6xl !text-right xl:!text-5xl lg:!text-center lg:!text-6xl md:!text-5xl sm:!text-3xl "
              />
              <p className="my-4 text-base font-medium">
                As a skilled web developer, I am dedicated to turning
                ideas into innovative web applications. Explore my latest
                projects and articles, showcasing my expertise in React.js, Next.js and
                web development.
              </p>
              <div className="flex items-center  self-start lg:self-center">
                <Link
                  href="/Sifat.pdf"
                  target={"_blank"}
                  className="bg-dark flex gap-2 items-center p-2.5 text-light px-5 rounded-lg text-lg font-semibold hover:bg-light hover:text-dark transition-all border-2 border-solid border-transparent hover:border-dark dark:bg-light dark:text-dark hover:dark:bg-dark hover:dark:text-light hover:dark:border-light md:p-2 md:px-4 md:text-base"
                  download={true}
                >
                  resume <FaArrowUpRightFromSquare />
                </Link>
                {/* <Link
                  href="/contact"
                  target={"_blank"}
                  className="ml-4 font-semibold capitalize dark:text-light text-dark underline md:text-base"
                >
                  Contact
                </Link> */}
                {contact}
              </div>
            </div>
          </div>
        </Layout>
        <HireMe />
      </main>
    </>
  );
}
