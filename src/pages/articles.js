import AnimatedText from "@/components/AnimatedText";
import Layout from "@/components/Layout";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import article1 from "../../public/images/articles/pagination component in reactjs.jpg";
import article2 from "../../public/images/articles/create loading screen in react js.jpg";
import article3 from "../../public/images/articles/create modal component in react using react portals.png";
import article4 from "../../public/images/articles/form validation in reactjs using custom react hook.png";
import article5 from "../../public/images/articles/smooth scrolling in reactjs.png";
import article6 from "../../public/images/articles/todo list app built using react redux and framer motion.png";
import { motion,useMotionValue } from "framer-motion";
import { useRef } from "react";
import TransitionEffects from "@/components/TransitionEffects";

const FramerImage = motion(Image);

function MovingImg({title,img,link}){
 const ref =useRef(null)
 const x= useMotionValue(0)
 const y= useMotionValue(0)
 const handleMouse  =(e)=>{
ref.current.style.display="inline-block"
x.set(e.pageX)
y.set(-10)
 }
 const handleMouseLeave  =(e)=>{
  ref.current.style.display = "none";
x.set(0);
y.set(0);
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
      style={{x:x,y:y}}
      initial={{opacity:0}}
      whileInView={{opacity:1}}
      className="w-96 z-10 h-auto hidden absolute rounded-lg md:!hidden"
    />
  </Link>
);
}

function Article({img,title,date,link}){
return <motion.li initial={{y:200}}  whileInView={{y:0,transition:{duration:1, ease:"easeInOut"}}} viewport={{once:true}} className="relative w-full p-4 py-6 my-4 rounded-xl flex items-center justify-between bg-light first:mt-0 border border-solid dark:bg-dark dark:border-light border-dark border-r-4 border-b-4 sm:flex-col">
<MovingImg title={title} img={img} link={link}/>
 <span className="text-primary pl-4 xs:text-sm sm:text-left sm:p-0">{date}</span>
</motion.li>
}
function FeaturedArticles({ img, title, link, time, summary }) {
  return (
    <li className=" relative col-span-1 w-full p-4 bg-light dark:bg-dark border-solid border-dark border rounded-2xl">
      <div className="absolute top-0 -right-3 -z-10 w-[102%] h-[103%]  bg-dark rounded-[2rem] rounded-br-3xl dark:bg-light"></div>
      <Link
        href={link}
        target="blank"
        className=" rounded-lg overflow-hidden inline-block"
      >
        <FramerImage
          src={img}
          alt="img"
          className="w-full h-auto"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.2 }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
        />
      </Link>
      <Link href={link}>
        <h2 className="hover:underline capitalize 2xl mt-4 xs-text-lg font-semibold">
          {title}
        </h2>
      </Link>
      <p className="text-sm mb-2">{summary}</p>
      <span className="text-primary font-semibold">{time}</span>
    </li>
  );
}

function articles() {
  return (
    <>
      <Head>
        <title>williams||articles page</title>
        <meta name="description " content="any description" />
      </Head>
      <TransitionEffects/>
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

export default articles;
