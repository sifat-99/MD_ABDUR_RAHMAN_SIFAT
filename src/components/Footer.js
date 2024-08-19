import Link from "next/link";
import Layout from "./Layout";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedinIn,
  FaTwitter,
  FaGithub,
} from "react-icons/fa";
import { motion } from "framer-motion";

function Footer() {
  return (
    <footer className="w-full pt-8 border-t-2 dark:text-light py-2 px-16 dark:border-light border-solid border-dark font text-lg sm:text-base">
      <div className="text-center flex flex-col gap-y-2">
        <h3>{new Date().getFullYear()} &copy; All rights reserved</h3>

        <Link href="https://github.com/sifat-99" target="_blank">
        <span className="underline">Created by Md Abdur Rahman Sifat</span>
        </Link>

        <div className="flex items-center gap-2 justify-center ">
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
        </div>
      </div>
    </footer>
  );
}

export default Footer;
