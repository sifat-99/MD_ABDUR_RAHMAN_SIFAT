import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import Head from "next/head";
import Image from "next/image";
import profilePic from "../../public/images/projects/williams port2.jpg";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import Skills from "@/components/skills";
import Experience from "@/components/Experience";
import TransitionEffects from "@/components/TransitionEffects";

const AnimatedNumber = ({ value }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });
  const isInView = useInView(ref,{once:true});
  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);
  useEffect(() => {
    springValue.on("change", (latest) => {
if(ref.current&&latest.toFixed()<=value){
ref.current.textContent=latest.toFixed(0)
}
    });
  }, [springValue,value]);
  return <span ref={ref}></span>;
};

function about() {
  return (
    <>
      <Head>
        <title>Sifat&apos;s || about page</title>
        <meta name="description " content="any description" />
      </Head>
      <TransitionEffects />
      <main>
        <Layout className="pt-16">
          <AnimatedText
            text="Passion Fuels Purpose!"
            className="my-16 lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8"
          />
          <div className="grid grid-cols-8 gap-16 sm:gap-8 dark:text-light">
            <div className="col-span-3 flex flex-col item-start justify-center xl:col-span-4 md:order-2 md:col-span-8">
              <h2 className="mb-4 text-lg font-bold uppercase dark:text-stone-100 text-dark/75">
                biography
              </h2>
              <p className="font-medium text-dark dark:text-light">
                Hi, I&apos;m williams, a web developer with a passion for
                creating beautiful, functional, and user-centered digital
                experiences. With 1 years of experience in the field. I am
                always looking for new and innovative ways to bring my clients
                visions to life.
              </p>
              <p className="font-medium text-dark dark:text-light">
                I believe that design is about more than just making things look
                pretty it&apos;s about solving problems and creating intuitive,
                enjoyable experiences for users.
              </p>
              <p className="font-medium text-dark">
                Whether I&apos;m working on a website or other digital product,
                I bring my commitment to design excellence and user-centered
                thinking to every project I work on. I look forward to the
                opportunity to bring my skills and passion to your next project.
              </p>
            </div>
            <div className="col-span-3 xl:col-span-4 relative h-max rounded-2xl border-solid border-dark border-2 bg-light p-8 first:mt-0  border-r-8 border-b-8 dark:border-light dark:bg-dark md:order-1 md:col-span-8">
              <div className="absolute top-0 -right-3 -z-10 w-[102%] h-[103%] rounded-2xl  bg-dark"></div>
              <Image
                src={profilePic}
                alt="williams"
                className="w-full h-auto rounded-2xl"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="col-span-2 flex flex-col items-end justify-between xl:col-span-8 xl:flex-row xl:items-center md:order-3">
              <div className="flex flex-col justify-center items-end xl:items-center">
                <span className="text-7xl font-bold inline-block md:text-6xl sm:text-5xl xs:text-4xl">
                  <AnimatedNumber value={9} /> +
                </span>
                <h2 className="text-xl medium capitalize xl:text-center sm:text-base xs:text-sm md:text-xl dark:text-light text-dark/75">
                  satisfied client
                </h2>
              </div>
              <div className="flex flex-col justify-center items-end">
                <span className="text-7xl font-bold inline-block  md:text-6xl sm:text-5xl xs:text-4xl">
                  <AnimatedNumber value={4} />+
                </span>
                <h2 className="text-xl medium capitalize  text-dark/75 dark:text-light xl:text-center sm:text-base xs:text-sm md:text-xl">
                  projects completed
                </h2>
              </div>
              <div className="flex flex-col justify-center items-end">
                <span className="text-7xl font-bold inline-block  md:text-6xl sm:text-5xl xs:text-4xl">
                  <AnimatedNumber value={1} />+
                </span>
                <h2 className="text-xl medium capitalize xl:items-center dark:text-light xl:text-center sm:text-base xs:text-sm md:text-xl text-dark/75">
                  years of experienxe
                </h2>
              </div>
            </div>
          </div>
          <Skills />
          {/* <Experience/> */}
        </Layout>
      </main>
    </>
  );
}

export default about;
