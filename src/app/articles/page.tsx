"use client";
import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import article1 from "../../../public/images/articles/pagination component in reactjs.jpg";
import article2 from "../../../public/images/articles/create loading screen in react js.jpg";
import article3 from "../../../public/images/articles/create-modal-component-in-react-using-react-portals.png";
import article4 from "../../../public/images/articles/form-validation-in-reactjs-using-custom-react-hook.png";
import article5 from "../../../public/images/articles/smooth scrolling in reactjs.png";
import article6 from "../../../public/images/articles/todo list app built using react redux and framer motion.png";
import { motion, useMotionValue } from "framer-motion";
import { useRef } from "react";
import TransitionEffects from "@/components/TransitionEffects";

const FramerImage = motion(Image);

function MovingImg({ title, img, link }: { title: string, img: StaticImageData, link: string }) {
    const ref = useRef<HTMLImageElement>(null)
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    const handleMouse = (e: React.MouseEvent) => {
        if (ref.current) {
            ref.current.style.display = "inline-block"
            x.set(e.pageX)
            y.set(-10)
        }
    }
    const handleMouseLeave = (e: React.MouseEvent) => {
        if (ref.current) {
            ref.current.style.display = "none";
            x.set(0);
            y.set(0);
        }
    }
    return (
        <Link
            href={link}
            target="_blank"
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
        >
            <h2 className="capitalize text-xl font-semibold hover:underline">
                {title}
            </h2>
            <FramerImage
                src={img}
                alt={title}
                ref={ref}
                style={{ x: x, y: y } as any}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="w-96 z-10 h-auto hidden absolute rounded-lg md:!hidden"
            />
        </Link>
    );
}

function Article({ img, title, date, link }: { img: StaticImageData, title: string, date: string, link: string }) {
    const MotionLi = motion.li as any;
    return (
        <MotionLi
            initial={{ y: 200 }}
            whileInView={{ y: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
            viewport={{ once: true }}
            className="relative w-full p-4 py-6 my-4 rounded-xl flex items-center justify-between bg-light text-dark first:mt-0 border border-solid border-dark border-r-4 border-b-4 dark:border-light dark:bg-dark dark:text-light sm:flex-col"
        >
            <MovingImg title={title} img={img} link={link} />
            <span className="text-primary font-semibold pl-4 dark:text-primaryDark sm:self-start sm:pl-0 xs:text-sm">
                {date}
            </span>
        </MotionLi>
    );
}
function FeaturedArticles({ img, title, link, time, summary }: { img: StaticImageData, title: string, link: string, time: string, summary: string }) {
    return (
        <li className="relative col-span-1 w-full p-4 bg-light dark:bg-dark border-solid border-dark border rounded-2xl">
            <div className="absolute top-0 -right-3 -z-10 w-[102%] h-[103%] bg-dark rounded-[2rem] rounded-br-3xl dark:bg-light" />
            <Link
                href={link}
                target="_blank"
                className="w-full inline-block cursor-pointer overflow-hidden rounded-lg"
            >
                <FramerImage
                    src={img}
                    alt={title}
                    className="w-full h-auto"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                />
            </Link>
            <Link href={link} target="_blank">
                <h2 className="capitalize text-2xl font-bold my-2 mt-4 hover:underline xs:text-lg">
                    {title}
                </h2>
            </Link>
            <p className="text-sm mb-2">{summary}</p>
            <span className="text-primary font-semibold dark:text-primaryDark">
                {time}
            </span>
        </li>
    );
}

export default function Articles() {
    return (
        <>
            <TransitionEffects />
            <main className="w-full flex items-center dark:text-light flex-col justify-center overflow-hidden ">
                <Layout>
                    <AnimatedText
                        text="
         Words Can Change The World! "
                        className="mb-6 lg:!text-7xl sm:mb-8 sm:!text-6xl xs:!text-4xl"
                    />
                    <ul className="grid grid-cols-2 gap-16 md:grid-cols-1 lg:gap-8 md:gap-y-16">
                        <FeaturedArticles
                            title="
Build A Custom Pagination Component In Reactjs From Scratch"
                            summary="Learn how to build a custom pagination component in ReactJS from scratch.
Follow this step-by-step guide to integrate Pagination component in your ReactJS project."
                            time="9min read"
                            link="/"
                            img={article2}
                        />
                        <FeaturedArticles
                            title="
Build A Custom Pagination Component In Reactjs From Scratch"
                            summary="Learn how to build a custom pagination component in ReactJS from scratch.
Follow this step-by-step guide to integrate Pagination component in your ReactJS project."
                            time="9min read"
                            link="/"
                            img={article1}
                        />
                    </ul>
                    <h2 className="font-semibold text-center text-4xl mt-10">
                        All articles
                    </h2>
                    <ul>
                        <Article
                            title="Form Validation In Reactjs: Build A Reusable Custom Hook For Inputs And Error Handling"
                            img={article3}
                            date="march 22 2023"
                            link="/"
                        />
                        <Article
                            title="Form Validation In Reactjs: Build A Reusable Custom Hook For Inputs And Error Handling"
                            img={article4}
                            date="march 22 2023"
                            link="/"
                        />
                        <Article
                            title="Form Validation In Reactjs: Build A Reusable Custom Hook For Inputs And Error Handling"
                            img={article5}
                            date="march 22 2023"
                            link="/"
                        />
                        <Article
                            title="Form Validation In Reactjs: Build A Reusable Custom Hook For Inputs And Error Handling"
                            img={article6}
                            date="march 22 2023"
                            link="/"
                        />
                    </ul>
                </Layout>
            </main>
        </>
    );
}
