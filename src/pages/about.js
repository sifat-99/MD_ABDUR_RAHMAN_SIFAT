import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import Head from "next/head";
import Image from "next/image";
import profilePic from "../../public/Sifat.png";
import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import Skills from "@/components/skills";
import Experience from "@/components/Experience";
import TransitionEffects from "@/components/TransitionEffects";
import { FaDotCircle } from "react-icons/fa";

const AnimatedNumber = ({ value }) => {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: 3000 });
  const isInView = useInView(ref, { once: true });
  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);
  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current && latest.toFixed() <= value) {
        ref.current.textContent = latest.toFixed(0);
      }
    });
  }, [springValue, value]);
  return <span ref={ref}></span>;
};

function about() {
  return (
    <>
      <Head>
        <title>SIFAT || about page</title>
        <meta name="description " content="any description" />
      </Head>
      <TransitionEffects />
      <main>
        <Layout className="pt-12 bg-transparent dark:bg-transparent">
          <AnimatedText
            text="Passion Fuels Purpose!"
            className="mb-12 lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8"
          />
          <div className="grid grid-cols-10 gap-16 sm:gap-8 dark:text-light">
            <div className="col-span-3 flex flex-col item-start justify-center xl:col-span-5 md:order-2 md:col-span-10">
              <h2 className="mb-4 text-lg font-bold uppercase dark:text-stone-100 text-dark/75">
                biography
              </h2>
              <p className="font-medium text-dark dark:text-light text-justify mb-2">
                Hi, I&apos;m Md: Abdur Rahman SIfat, a web developer with a
                passion for creating beautiful, functional, and user-centered
                digital experiences. With 1 years of experience in the field. I
                am always looking for new and innovative ways to bring my
                clients visions to life.
              </p>
              <p className="font-medium text-dark dark:text-light text-justify mb-2">
                I believe that design is about more than just making things look
                pretty it&apos;s about solving problems and creating intuitive,
                enjoyable experiences for users.
              </p>
              <p className="font-medium text-dark dark:text-light text-justify">
                Whether I&apos;m working on a website or other digital product,
                I bring my commitment to design excellence and user-centered
                thinking to every project I work on. I look forward to the
                opportunity to bring my skills and passion to your next project.
              </p>
            </div>
            <div className="col-span-4 xl:col-span-5 relative h-max rounded-2xl border-solid border-dark border-2 bg-light p-8 first:mt-0  border-r-8 border-b-8 dark:border-light dark:bg-dark md:order-1 md:col-span-10">
              <div className="absolute top-0 -right-3 -z-10 w-[102%] h-[103%] rounded-2xl  bg-dark"></div>
              <Image
                src={profilePic}
                alt="Md: Abdur Rahman SIfat"
                className="w-full h-auto rounded-2xl"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            <div className="col-span-3 flex flex-col item-start justify-center xl:col-span-5 md:order-2 md:col-span-10 lg:col-span-10">
              <h2 className="mb-4 text-2xl underline font-bold uppercase dark:text-stone-100 text-dark/75">
                Personal Info
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-dark dark:text-light text-nowrap text-xl">
                    <span className="font-semibold ">Name:</span> Md: Abdur
                    Rahman Sifat
                  </p>
                  <p className="font- text-base text-dark dark:text-light text-nowrap">
                    <span className="font-semibold">Email:</span>
                    <a
                      href="mailto:mdabdurrahmansifat@gmail.com"
                      className="hover:underline text-blue-700"
                    >
                      {" "}
                      mdabdurrahmansifat@gmail.com
                    </a>
                  </p>
                  <p className="font-medium text-dark dark:text-light text-nowrap">
                    <span className="font-semibold">Location:</span> Dhaka,
                    Bangladesh
                  </p>

                  <p className="font-medium text-dark dark:text-light text-nowrap">
                    <span className="font-semibold">Phone:</span>
                    <span className="font-bold"> +8801521788920</span>
                  </p>

                  <p className="font-medium text-dark dark:text-light text-nowrap flex  justify-start items-center gap-2">
                    <span className="font-semibold">Freelance:</span> <span className="text-green-300 font-bold text-xl flex justify-center items-center gap-2">Available <FaDotCircle className="inline-block text-green-300" /></span> 
                  </p>

                  <p className="font-medium text-dark dark:text-light text-nowrap">
                    <span className="font-semibold">Languages:</span> Bangla,
                    English, Hindi
                  </p>

                  <p className="font-medium text-dark dark:text-light text-nowrap">
                    <span className="font-semibold">Hobbies:</span> Coding,
                    Traveling
                  </p>
                </div>
              </div>
            </div>
          </div>
          <Skills />
        </Layout>
      </main>
    </>
  );
}

export default about;
