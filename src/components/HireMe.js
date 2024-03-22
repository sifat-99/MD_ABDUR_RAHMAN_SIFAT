import Link from "next/link";
import { CircularText } from "./Icons";

function HireMe() {
  return (
    <div className="fixed left-4 bottom-4 items-center flex overflow-hidden justify-center md:right-8 md:left-auto md:top-0 md:bottom-auto md:absolute sm:right-0">
      <div className="w-48 h-auto relative flex items-center justify-center md:w-24">
        <CircularText className=" fill-black animate-spin-slow dark:fill-light " />
        <Link
          href="mailto:mdabdurrahmansifat@gmail.com"
          className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark text-light border shadow-md border-solid w-20 h-20 rounded-full hover:bg-white hover:text-dark transition-all dark:bg-light dark:text-dark hover:dark:bg-dark hover:dark:text-light hover:dark:border-light capitalize font-semibold md:w-12 md:h-12 md:text-[10px]"
        >
          hire me
        </Link>
      </div>
    </div>
  );
}

export default HireMe;
