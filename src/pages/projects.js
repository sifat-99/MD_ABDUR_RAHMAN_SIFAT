import AnimatedText from "@/components/AnimatedText";
// import Layout from "@/components/Layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { DiGithubAlt } from "react-icons/di";
import { motion } from "framer-motion";
import TransitionEffects from "@/components/TransitionEffects";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const FramerImage = motion(Image);

function FeaturedProject({ type, title, summary, img, link, github }) {
  return (
    <article className="w-full flex justify-between items-center border border-solid shadow-2xl bg-transparent border-dark rounded-3xl relative dark:bg-dark lg:flex-col lg:p-8 xs:rounded-2xl xs:rounded-br-3xl xs:p-4">
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
function Project({
  title,
  description,
  live,
  img,
  Client_Side,
  Server_Side,
  technologies,
}) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };
  return (
    <article className="w-full h-full rounded-2xl border bg-transparent p-6 border-dark dark:bg-transparent dark:border-light xs:p-4">
    <Slider {...settings}>
      {img.map((image, index) => (
        <div key={index}>
          <Link href={live} target="_blank">
            <FramerImage
              src={image}
              alt="img"
              width={100}
              height={100}
              className="w-full h-full"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 1.2 }}
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
            />
          </Link>
        </div>
      ))}
    </Slider>
    <div className="flex flex-col gap-8 justify-center dark:text-light items-start">
      <div>
        <h2 className="lg:text-2xl text-left capitalize text-dark text-lg font-semibold dark:text-white mt-2">
          {title}
        </h2>
        <p className="text-[13px] text-dark dark:text-stone-300">
          {description}
        </p>
      </div>
      <div className="flex items-center justify-between w-full">
          <Link
            href={live}
            target="_blank"
            className="rounded-lg bg-dark text-light text-lg font-semibold p-2 px-4 underline md:text-base"
          >
            visit
          </Link>
          <div className="flex gap-4">
            <Link
              href={Client_Side}
              target="_blank"
              className="text-dark flex flex-col items-center justify-center text-sm"
            >
              Server Site
              <DiGithubAlt className="text-4xl text-dark dark:text-stone-100" />
            </Link>
            <Link
              href={Server_Side}
              target="_blank"
              className="text-dark flex flex-col items-center justify-center text-sm"
            >
              Client Site
              <DiGithubAlt className="text-4xl text-dark dark:text-stone-100" />
            </Link>
          </div>
        </div>
      </div>
  </article>
  );
}

function Projects() {
  const [projects, setProjects] = useState([]);
  useEffect(() => {
    fetch("/Projects.json")
      .then((res) => res.json())
      .then((data) => setProjects(data));
  }, []);

  return (
    <>
      <Head>
        <title>SIFAT || projects page</title>
        <meta name="description " content="any description" />
      </Head>
      <TransitionEffects />
      <main>
        <AnimatedText
          text="projects"
          className="mb-16 lg:!text-7xl mt-4 sm:mb-8 sm:!text-6xl xs:!text-4xl"
        />
        <Layout className="mt-6 ">
          <div className="  bg-gradient-to-r from-[#b9b4e9] via-[#b191f1] to-[#f1a5fd] dark:bg-gradient-to-r dark:from-[#191919] dark:via-[#040304] dark:to-[#000000] ">
            <div
              className={`mb-6 ${projects.length > 2 ? "lgs:grid-cols-3 gap-4" : "lgs:grid-cols-2 gap-12"} lgs:grid `}
            >
              {projects.map((project, index) => (
                <Project
                  key={index}
                  title={project.title}
                  description={project.description}
                  live={project.live_link}
                  img={project.images}
                  Client_Side={project.github_link}
                  Server_Side={project.server_link}
                  technologies={project.technology_used}
                />
              ))}
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
}

export default Projects;

{
  /* <Project
                title="worldist app"
                summary="A feature-rich A world map that tracks your footsteps into every city you can think of. Never forget your wonderful experiences, and show your friends how you have wandered the world. "
                link="https://worldist-app.netlify.app/"
                img={project1}
              /> */
}
