import Link from "next/link";
import Logo from "./Logo";
import { useRouter } from "next/router";
import { FaAlignRight } from "react-icons/fa6";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaInstagramSquare,
  FaLinkedinIn,
  FaTwitter,
  FaTwitterSquare,
} from "react-icons/fa";
import { motion } from "framer-motion";
import useDarkTheme from "./Hooks/useDarkTheme";
import {
  WiDaySunny,
  WiMoonAltNew,
  WiMoonAltWaningCrescent2,
} from "react-icons/wi";
import { useState } from "react";

const CustomLink = ({ href, title, className = "" }) => {
  const router = useRouter();
  console.log(router);
  return (
    <Link
      href={href}
      className={`${className} relative group-hover:w-full dark:text-light`}
    >
      {title}{" "}
      <span
        className={`h-[2px] inline-block dark:bg-light w-0 transition-[width] ease duration-300 bg-black left-0 -bottom-0.5 absolute group-hover:w-full ${
          router.asPath === href ? "w-full" : "w-0"
        }`}
      >
        &nbsp;
      </span>
    </Link>
  );
};
const CustomMobileLink = ({ href, title, className = "", toggle }) => {
  const router = useRouter();
  const handleMobileClick = function () {
    toggle();
    router.push(href);
  };
  console.log(router);
  return (
    <button
      onClick={handleMobileClick}
      href={href}
      className={`${className} relative group-hover:w-full my-2 text-light dark:text-dark `}
    >
      {title}{" "}
      <span
        className={`h-[2px] inline-block dark:bg-dark bg-light w-0 transition-[width] ease duration-300  left-0 -bottom-0.5 absolute group-hover:w-full ${
          router.asPath === href ? "w-full" : "w-0"
        }`}
      >
        &nbsp;
      </span>
    </button>
  );
};
function Navbar() {
  const [mode, setMode] = useDarkTheme();
  const [isOpen, setIsOpen] = useState(false);
  const handleClick = function () {
    setIsOpen(!isOpen);
  };
  return (
    <header className="w-full px-32 py-8 font-medium flex items-center justify-between realtive md:px-12 sm:px-8 lg:px16">
      <button
        className="lg:flex items-center hidden flex-col justify-center transition-all duration-300 ease-out"
        onClick={handleClick}
      >
        <span
          className={`bg-dark dark:bg-light h-0.5 block transition-all duration-300 ease-out  w-6 rounded-sm ${
            isOpen ? "rotate-45 translate-y-1" : "-translate-y-0.5"
          } `}
        ></span>
        <span
          className={`bg-dark dark:bg-light h-0.5 block transition-all duration-300 ease-out  w-6 rounded-sm my-0.5 ${
            isOpen ? "opacity-0" : "opacity-100"
          }`}
        ></span>
        <span
          className={`bg-dark dark:bg-light h-0.5 block transition-all duration-300 ease-out  w-6 rounded-sm  ${
            isOpen ? "-rotate-45 -translate-y-1" : "translate-y-0.5"
          }`}
        ></span>
      </button>
      <div className="w-full flex items-center justify-between lg:hidden">
        <nav>
          <CustomLink href="/" title="Home" className="" />
          <CustomLink href="/about" title="About" className="mx-4" />
          <CustomLink href="/projects" title="Projects" className="mx-4" />
          {/* <CustomLink href="/articles" title="articles" className="ml-4" /> */}
        </nav>

        <nav className="flex dark:text-primaryDark  flex-wrap items-center">
          <motion.a
            href="https://twitter.com/md_sifat_99"
            target={"_blank"}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.5 }}
            className=" mr-3 text-3xl"
          >
            <FaTwitter />
          </motion.a>
          <motion.a
            href="https://www.instagram.com/abdur_rahman_sifat_khan/"
            target={"_blank"}
            className=" mx-3  text-3xl"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.5 }}
          >
            <FaInstagram />
          </motion.a>
          <motion.a
            href="https://www.facebook.com/profile.php?id=100070987320961"
            target={"_blank"}
            className=" mx-3  text-3xl"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.5 }}
          >
            <FaFacebook />
          </motion.a>
          <motion.a
            href="https://www.linkedin.com/in/sifatmollah/"
            target={"_blank"}
            className=" ml-3  text-3xl"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.5 }}
          >
            <FaLinkedinIn />
          </motion.a>
          <motion.a
            href="https://github.com/sifat-99"
            target={"_blank"}
            className=" ml-3  text-3xl"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.5 }}
          >
            <FaGithub />
          </motion.a>
          <button
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            className="ml-6 flex items-center text-4xl rounded-full justify-center "
          >
            {mode === "dark" ? <WiDaySunny /> : <WiMoonAltWaningCrescent2 />}
          </button>
        </nav>
      </div>

      {isOpen && (
        <motion.div
          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
          animate={{ scale: 1, opacity: 1 }}
          className="min-w-[70vw] flex flex-col items-center justify-between z-10 bg-dark dark:bg-light/75 backdrop-blur-md rounded-lg py-32 fixed top-1/2 -translate-x-1/2 -translate-y-1/2 left-1/2"
        >
          <nav className="flex flex-col items-center justify-center">
            <CustomMobileLink
              href="/"
              title="Home"
              className=""
              toggle={handleClick}
            />
            <CustomMobileLink
              href="/about"
              title="About"
              className=""
              toggle={handleClick}
            />
            <CustomMobileLink
              href="/projects"
              title="Projects"
              className=""
              toggle={handleClick}
            />
            <CustomMobileLink
              href="/articles"
              title="articles"
              className=""
              toggle={handleClick}
            />
          </nav>

          <nav className="flex mt-2 flex-wrap text-primaryDark dark:text-dark items-center">
            <motion.a
              href="https://twitter.com/md_sifat_99"
              target={"_blank"}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.5 }}
              className=" mr-3 text-3xl"
            >
              <FaTwitter />
            </motion.a>
            <motion.a
              href="https://www.instagram.com/abdur_rahman_sifat_khan/"
              target={"_blank"}
              className=" mx-3  text-3xl"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.5 }}
            >
              <FaInstagram />
            </motion.a>
            <motion.a
              href="https://www.facebook.com/profile.php?id=100070987320961"
              target={"_blank"}
              className=" mx-3  text-3xl"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.5 }}
            >
              <FaFacebook />
            </motion.a>
            <motion.a
              href="https://www.linkedin.com/in/sifatmollah/"
              target={"_blank"}
              className=" ml-3  text-3xl"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.5 }}
            >
              <FaLinkedinIn />
            </motion.a>
            <motion.a
              href="https://github.com/sifat-99"
              target={"_blank"}
              className=" ml-3  text-3xl"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.5 }}
            >
              <FaGithub />
            </motion.a>
            <button
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              className="ml-6 flex items-center text-4xl rounded-full justify-center "
            >
              {mode === "dark" ? <WiDaySunny /> : <WiMoonAltWaningCrescent2 />}
            </button>
          </nav>
        </motion.div>
      )}
      <div className="absolute left-[50%] top-2 translate-x-[-50%]">
        <Logo />
      </div>
    </header>
  );
}

export default Navbar;
