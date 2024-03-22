import AnimatedText from "@/components/AnimatedText";
// import Layout from "@/components/Layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { DiGithubAlt } from "react-icons/di";
import project1 from "../../public/images/projects/Worldist-keep-track-of-your-adventures.png";
import project2 from "../../public/images/projects/mama-z-place (1)screen new.png";
import project3 from "../../public/images/projects/fast-react-pizza SCREENSHOT.png";
import project4 from "../../public/images/projects/React-App.png";
import project5 from "../../public/images/projects/loan shot.png";
import { motion } from "framer-motion";
import TransitionEffects from "@/components/TransitionEffects";
import Layout from "@/components/Layout";

const FramerImage = motion(Image);

function FeaturedProject({ type, title, summary, img, link, github }) {
  return (
    <article className="w-full flex justify-between items-center border border-solid shadow-2xl bg-light border-dark rounded-3xl relative dark:bg-dark lg:flex-col lg:p-8 xs:rounded-2xl xs:rounded-br-3xl xs:p-4">
      <div className="absolute top-0 -right-3 -z-10 w-[102%] h-[103%] rounded-2xl  bg-dark rounded-br-3xl dark:bg-light xs:-right-2 sm:h-[102%] xs-w-full xs:rounded-[1.5rem] "></div>
      <Link
        href={link}
        target="blank"
        className=" rounded-lg overflow-hidden lg:w-full w-1/2 "
      >
        <FramerImage
          src={img}
          alt="img"
          className="w-full h-auto"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.2 }}
        />
      </Link>

      <div className="  flex flex-col justify-between items-start dark:text-light  pl-6 lg:pl-0 lg:pt-6">
        <span className="text-xl xs:text-base">{type}</span>
        <Link href={link} target="blank">
          <h2 className="my-2 text-4xl sm:text-sm capitalize text-dark  font-semibold dark:text-white  text-left">
            {title}
          </h2>
        </Link>

        <p className="my-2 text-dark dark:text-white sm:text-sm">{summary}</p>
        <div className="mt-2 flex items-center">
          <Link
            href="https://github.com/willybrown100/Worldist"
            target="_blank"
            className="text-dark"
          >
            <DiGithubAlt className="text-4xl  text-dark dark:text-stone-100" />
          </Link>
          <Link
            href={link}
            target="blank"
            className="rounded-lg bg-dark text-light text-lg font-semibold p-2 px-4 sm:text-base sm:px-4"
          >
            visit project
          </Link>
        </div>
      </div>
    </article>
  );
}
function Project({ type, link, img, title, summary }) {
  return (
    <article className="w-full   rounded-2xl  border bg-light p-6 border-dark dark:bg-dark dark:border-light xs:p-4 ">
      <div className="grid gap-2 h-[29rem] grid-rows-[1fr,1fr,auto]">
        <Link
          href={link}
          target="blank"
          className=" rounded-lg overflow-hidden "
        >
          <FramerImage
            src={img}
            alt="img"
            className="w-full h-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 1.2 }}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
          />
        </Link>
        <div className="  flex flex-col justify-between dark:text-light  items-start ">
          <h2 className="lg:text-2xl text-left capitalize text-dark text-lg font-semibold dark:text-white mt-2">
            {title}
          </h2>
          <p className=" text-[13px] text-dark dark:text-stone-300">
            {summary}
          </p>
        </div>
        <div className="mt-2 w-full flex items-center  justify-between ">
          <Link
            href={link}
            target="blank"
            className="rounded-lg bg-dark text-light text-lg font-semibold p-2 px-4 underline md:text-base"
          >
            visit
          </Link>
          <Link
            href="https://github.com/willybrown100/Worldist"
            target="_blank"
            className="text-dark"
          >
            <DiGithubAlt className="text-4xl  text-dark dark:text-stone-100" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function projects() {
  return (
    <>
      <Head>
        <title>projects page</title>
        <meta name="description " content="any description" />
      </Head>
      <TransitionEffects />
      <main>
        <AnimatedText
          text="projects"
          className="mb-16 lg:!text-7xl mt-4 sm:mb-8 sm:!text-6xl xs:!text-4xl"
        />
        <Layout className="mt-6">
          <div className="  lgs:grid lgs:grid-cols-3 gap-2">
            <div className="mb-6">
              <Project
                title="worldist app"
                summary="A feature-rich A world map that tracks your footsteps into every city you can think of. Never forget your wonderful experiences, and show your friends how you have wandered the world. "
                link="https://worldist-app.netlify.app/"
                img={project1}
              />
            </div>
            <div className="mb-6">
              <Project
                title="mama z"
                summary="mama z is a business that prepares and serves food and drinks to customers.[1] Meals are generally served and eaten on the premises, but many restaurants also offer take-out and food delivery services. mama z vary greatly in appearance and offerings, including a wide variety of cuisines and service models ranging from inexpensive"
                link="https://mamaz-app.netlify.app/"
                img={project2}
              />
            </div>
            <div className="mb-6">
              {" "}
              <Project
                title=" fast food"
                summary="fast food is a unique and expansive food delivery service. Rather than open our own food service establishment, which has limited potential, we propose a venture that involves only delivering food made and provided by others. Certain restaurants and fast food locations do not offer the convenience of a delivery service. Our business aims to fill that portion of the market that has so far been neglected."
                link="https://fast-food-apps.netlify.app/"
                img={project3}
              />
            </div>
            <div className="mb-6">
              {" "}
              <Project
                title="long dist"
                summary="allow users to Store all your travel list and important information digitally, usually in a cloud-based storage system. Type, write, and draw notes on the device of choice just as one would using pen and pape"
                link="https://long-dist.netlify.app/"
                img={project4}
              />
            </div>
            <div className="mb-6">
              {" "}
              <Project
                title="t loan"
                summary="A loan lending app is a mobile application that allows users to apply for and receive loans from lenders. These apps typically offer a variety of loan types, such as personal loans, business loans, and student loans. They can also offer a variety of loan terms, such as short-term loans and long-term loans"
                link="https://long-dist.netlify.app/"
                img={project5}
              />
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
}

export default projects;
