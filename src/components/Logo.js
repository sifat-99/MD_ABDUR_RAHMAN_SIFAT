import Link from "next/link";
import {motion} from "framer-motion"
const MotionLink = motion(Link)
function Logo() {
  return (
    <div className="flex justify-center items-center mt-2">
      <MotionLink
        href="/"
        className="w-16 h-16 bg-black text-light flex justify-center items-center rounded-full dark:border-light"
        whileHover={{
          backgroundColor: [
            "#121212",
            "rgba(131,58,180,1)",
            "rgba(253,29,29,1)",
            "rgba(252,176,69,1)",
            "rgba(131,58,180,1)",
            "#121212",
          ],
          transition:{duration:1,repeat:Infinity},
        }}
      >
        Return
      </MotionLink>
    </div>
  );
}

export default Logo;
