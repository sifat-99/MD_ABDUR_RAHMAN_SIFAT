import { motion } from "framer-motion";

const quote = {
    initial: {
        opacity: 0,
    },
    animate: {
        opacity: 1,
        transition: { delay: 0.5, staggerChildren: 0.09 },
    },
};
const singleWord = {
    initial: {
        opacity: 0,
        y: 50,
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 1 },
    },
};

interface Props {
    text: string;
    className?: string;
}

function AnimatedText({ text, className = "" }: Props) {
    const MotionH1 = motion.h1 as any;
    const MotionSpan = motion.span as any;

    return (
        <div className="w-full mx-auto py-2 sm:py-0 flex dark:text-light items-center justify-center text-center overflow-hidden">
            <MotionH1
                className={`inline-block tracking-wide dark:text-light w-full text-dark font-bold capitalize text-5xl ${className}`}
                variants={quote}
                initial="initial"
                animate="animate"
            >
                {text.split(" ").map((word, index) => (
                    <MotionSpan
                        key={word + "-" + index}
                        className="inline-block"
                        variants={singleWord}
                    >
                        {word}&nbsp;
                    </MotionSpan>
                ))}
            </MotionH1>
        </div>
    );
}

export default AnimatedText;
