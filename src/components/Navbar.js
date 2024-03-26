import Link from "next/link";
import Logo from "./Logo";
import { useRouter } from "next/router";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
} from "react-icons/fa";
import { motion } from "framer-motion";
import useDarkTheme from "./Hooks/useDarkTheme";
import { useState } from "react";

const CustomLink = ({ href, title, className = "" }) => {
  const router = useRouter();
  // console.log(router);
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
            className=" ml-4  text-3xl"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.5 }}
          >
            <FaGithub />
          </motion.a>
          <div
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            className="ml-6 flex items-center text-4xl rounded-full justify-center cursor-pointer transition-all"
          >
            {mode === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth={2}
                >
                  <circle cx={12} cy={32} r={5}>
                    <animate
                      fill="freeze"
                      attributeName="cy"
                      dur="0.6s"
                      values="32;12"
                    ></animate>
                  </circle>
                  <g strokeDasharray={2} strokeDashoffset={2}>
                    <path d="M0 0">
                      <animate
                        fill="freeze"
                        attributeName="d"
                        begin="0.7s"
                        dur="0.2s"
                        values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.7s"
                        dur="0.2s"
                        values="2;0"
                      ></animate>
                    </path>
                    <path d="M0 0">
                      <animate
                        fill="freeze"
                        attributeName="d"
                        begin="0.9s"
                        dur="0.2s"
                        values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.9s"
                        dur="0.2s"
                        values="2;0"
                      ></animate>
                    </path>
                    <animateTransform
                      attributeName="transform"
                      dur="30s"
                      repeatCount="indefinite"
                      type="rotate"
                      values="0 12 12;360 12 12"
                    ></animateTransform>
                  </g>
                </g>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
              >
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                >
                  <g strokeDasharray={2}>
                    <path d="M12 21v1M21 12h1M12 3v-1M3 12h-1">
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.2s"
                        values="4;2"
                      ></animate>
                    </path>
                    <path d="M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5">
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.2s"
                        dur="0.2s"
                        values="4;2"
                      ></animate>
                    </path>
                  </g>
                  <path
                    fill="currentColor"
                    d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z"
                    opacity={0}
                  >
                    <set attributeName="opacity" begin="0.5s" to={1}></set>
                  </path>
                </g>
                <g fill="currentColor" fillOpacity={0}>
                  <path d="m15.22 6.03l2.53-1.94L14.56 4L13.5 1l-1.06 3l-3.19.09l2.53 1.94l-.91 3.06l2.63-1.81l2.63 1.81z">
                    <animate
                      id="lineMdSunnyFilledLoopToMoonFilledLoopTransition0"
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="0.6s;lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+6s"
                      dur="0.4s"
                      values="0;1"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.2s"
                      dur="0.4s"
                      values="1;0"
                    ></animate>
                  </path>
                  <path d="M13.61 5.25L15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z">
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3s"
                      dur="0.4s"
                      values="0;1"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.2s"
                      dur="0.4s"
                      values="1;0"
                    ></animate>
                  </path>
                  <path d="M19.61 12.25L21.25 11l-2.06-.05L18.5 9l-.69 1.95l-2.06.05l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z">
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+0.4s"
                      dur="0.4s"
                      values="0;1"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.8s"
                      dur="0.4s"
                      values="1;0"
                    ></animate>
                  </path>
                  <path d="m20.828 9.731l1.876-1.439l-2.366-.067L19.552 6l-.786 2.225l-2.366.067l1.876 1.439L17.601 12l1.951-1.342L21.503 12z">
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3.4s"
                      dur="0.4s"
                      values="0;1"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="fill-opacity"
                      begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.6s"
                      dur="0.4s"
                      values="1;0"
                    ></animate>
                  </path>
                </g>
                <mask id="lineMdSunnyFilledLoopToMoonFilledLoopTransition1">
                  <circle cx={12} cy={12} r={12} fill="#fff"></circle>
                  <circle cx={22} cy={2} r={3} fill="#fff">
                    <animate
                      fill="freeze"
                      attributeName="cx"
                      begin="0.1s"
                      dur="0.4s"
                      values="22;18"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="cy"
                      begin="0.1s"
                      dur="0.4s"
                      values="2;6"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.1s"
                      dur="0.4s"
                      values="3;12"
                    ></animate>
                  </circle>
                  <circle cx={22} cy={2} r={1}>
                    <animate
                      fill="freeze"
                      attributeName="cx"
                      begin="0.1s"
                      dur="0.4s"
                      values="22;18"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="cy"
                      begin="0.1s"
                      dur="0.4s"
                      values="2;6"
                    ></animate>
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.1s"
                      dur="0.4s"
                      values="1;10"
                    ></animate>
                  </circle>
                </mask>
                <circle
                  cx={12}
                  cy={12}
                  r={6}
                  fill="currentColor"
                  mask="url(#lineMdSunnyFilledLoopToMoonFilledLoopTransition1)"
                >
                  <set attributeName="opacity" begin="0.5s" to={0}></set>
                  <animate
                    fill="freeze"
                    attributeName="r"
                    begin="0.1s"
                    dur="0.4s"
                    values="6;10"
                  ></animate>
                </circle>
              </svg>
            )}
          </div>
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
            {/* <CustomMobileLink
              href="/articles"
              title="articles"
              className=""
              toggle={handleClick}
            /> */}
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
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.5 }}
            >
              <FaGithub />
            </motion.a>
            <div
              onClick={() => setMode(mode === "light" ? "dark" : "light")}
              className="ml-6 flex items-center text-4xl rounded-full justify-center cursor-pointer transition-all"
            >
              {mode === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth={2}
                  >
                    <circle cx={12} cy={32} r={5}>
                      <animate
                        fill="freeze"
                        attributeName="cy"
                        dur="0.6s"
                        values="32;12"
                      ></animate>
                    </circle>
                    <g strokeDasharray={2} strokeDashoffset={2}>
                      <path d="M0 0">
                        <animate
                          fill="freeze"
                          attributeName="d"
                          begin="0.7s"
                          dur="0.2s"
                          values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"
                        ></animate>
                        <animate
                          fill="freeze"
                          attributeName="stroke-dashoffset"
                          begin="0.7s"
                          dur="0.2s"
                          values="2;0"
                        ></animate>
                      </path>
                      <path d="M0 0">
                        <animate
                          fill="freeze"
                          attributeName="d"
                          begin="0.9s"
                          dur="0.2s"
                          values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"
                        ></animate>
                        <animate
                          fill="freeze"
                          attributeName="stroke-dashoffset"
                          begin="0.9s"
                          dur="0.2s"
                          values="2;0"
                        ></animate>
                      </path>
                      <animateTransform
                        attributeName="transform"
                        dur="30s"
                        repeatCount="indefinite"
                        type="rotate"
                        values="0 12 12;360 12 12"
                      ></animateTransform>
                    </g>
                  </g>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 24 24"
                >
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  >
                    <g strokeDasharray={2}>
                      <path d="M12 21v1M21 12h1M12 3v-1M3 12h-1">
                        <animate
                          fill="freeze"
                          attributeName="stroke-dashoffset"
                          dur="0.2s"
                          values="4;2"
                        ></animate>
                      </path>
                      <path d="M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5">
                        <animate
                          fill="freeze"
                          attributeName="stroke-dashoffset"
                          begin="0.2s"
                          dur="0.2s"
                          values="4;2"
                        ></animate>
                      </path>
                    </g>
                    <path
                      fill="currentColor"
                      d="M7 6 C7 12.08 11.92 17 18 17 C18.53 17 19.05 16.96 19.56 16.89 C17.95 19.36 15.17 21 12 21 C7.03 21 3 16.97 3 12 C3 8.83 4.64 6.05 7.11 4.44 C7.04 4.95 7 5.47 7 6 Z"
                      opacity={0}
                    >
                      <set attributeName="opacity" begin="0.5s" to={1}></set>
                    </path>
                  </g>
                  <g fill="currentColor" fillOpacity={0}>
                    <path d="m15.22 6.03l2.53-1.94L14.56 4L13.5 1l-1.06 3l-3.19.09l2.53 1.94l-.91 3.06l2.63-1.81l2.63 1.81z">
                      <animate
                        id="lineMdSunnyFilledLoopToMoonFilledLoopTransition0"
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="0.6s;lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+6s"
                        dur="0.4s"
                        values="0;1"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.2s"
                        dur="0.4s"
                        values="1;0"
                      ></animate>
                    </path>
                    <path d="M13.61 5.25L15.25 4l-2.06-.05L12.5 2l-.69 1.95L9.75 4l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z">
                      <animate
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3s"
                        dur="0.4s"
                        values="0;1"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.2s"
                        dur="0.4s"
                        values="1;0"
                      ></animate>
                    </path>
                    <path d="M19.61 12.25L21.25 11l-2.06-.05L18.5 9l-.69 1.95l-2.06.05l1.64 1.25l-.59 1.98l1.7-1.17l1.7 1.17z">
                      <animate
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+0.4s"
                        dur="0.4s"
                        values="0;1"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+2.8s"
                        dur="0.4s"
                        values="1;0"
                      ></animate>
                    </path>
                    <path d="m20.828 9.731l1.876-1.439l-2.366-.067L19.552 6l-.786 2.225l-2.366.067l1.876 1.439L17.601 12l1.951-1.342L21.503 12z">
                      <animate
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+3.4s"
                        dur="0.4s"
                        values="0;1"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="fill-opacity"
                        begin="lineMdSunnyFilledLoopToMoonFilledLoopTransition0.begin+5.6s"
                        dur="0.4s"
                        values="1;0"
                      ></animate>
                    </path>
                  </g>
                  <mask id="lineMdSunnyFilledLoopToMoonFilledLoopTransition1">
                    <circle cx={12} cy={12} r={12} fill="#fff"></circle>
                    <circle cx={22} cy={2} r={3} fill="#fff">
                      <animate
                        fill="freeze"
                        attributeName="cx"
                        begin="0.1s"
                        dur="0.4s"
                        values="22;18"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="cy"
                        begin="0.1s"
                        dur="0.4s"
                        values="2;6"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="r"
                        begin="0.1s"
                        dur="0.4s"
                        values="3;12"
                      ></animate>
                    </circle>
                    <circle cx={22} cy={2} r={1}>
                      <animate
                        fill="freeze"
                        attributeName="cx"
                        begin="0.1s"
                        dur="0.4s"
                        values="22;18"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="cy"
                        begin="0.1s"
                        dur="0.4s"
                        values="2;6"
                      ></animate>
                      <animate
                        fill="freeze"
                        attributeName="r"
                        begin="0.1s"
                        dur="0.4s"
                        values="1;10"
                      ></animate>
                    </circle>
                  </mask>
                  <circle
                    cx={12}
                    cy={12}
                    r={6}
                    fill="currentColor"
                    mask="url(#lineMdSunnyFilledLoopToMoonFilledLoopTransition1)"
                  >
                    <set attributeName="opacity" begin="0.5s" to={0}></set>
                    <animate
                      fill="freeze"
                      attributeName="r"
                      begin="0.1s"
                      dur="0.4s"
                      values="6;10"
                    ></animate>
                  </circle>
                </svg>
              )}
            </div>
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
