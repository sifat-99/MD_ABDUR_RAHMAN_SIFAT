import { motion } from "framer-motion";

interface SkillProps {
    name: string;
    x: string;
    y: string;
}

function Skill({ name, x, y }: SkillProps) {
    const MotionDiv = motion.div as any;
    return (
        <MotionDiv
            className="flex items-center justify-center rounded-full font-semibold bg-dark text-light py-3 px-6 absolute dark:bg-light dark:text-dark shadow-dark cursor-pointer dark:shadow-white lg:py-2 lg:px-4 md:text-sm md:py-1.5 md:px-3 xs:bg-transparent xs:dark:bg-transparent xs:text-dark xs:dark:text-light xs:font-bold"
            whileHover={{ scale: 1.5 }}
            initial={{ x: 0, y: 0 }}
            whileInView={{ x: x, y: y, transition: { duration: 1.5 } }}
            viewport={{ once: true }}
        >
            {name}
        </MotionDiv>
    );
}
function Skills() {
    const MotionDiv = motion.div as any;
    return (
        <>
            <h2 className="font-bold underline mb-4 text-4xl mt-24 w-full text-center dark:text-light md:text-6xl md:mt-12 ">
                Skills
            </h2>
            <div
                className="w-full mb-8 h-screen lg:h-[80vh] sm:h-[60vh] xs:h-[50vh] relative rounded-full justify-center flex items-center bg-circularLight dark:bg-circularDark
       lg:bg-circularLightLg lg:dark:bg-circularDarkLg
       md:bg-circularLightMd md:dark:bg-circularDarkMd
       sm:bg-circularLightSm sm:dark:bg-circularDarkSm
        "
            >
                <MotionDiv
                    className="flex items-center justify-center rounded-full font-semibold bg-dark text-light py-4 px-4 dark:bg-light dark:text-dark cursor-pointer shadow-dark dark:shadow-white lg:p-6 md:p-4 xs:text-xs xs:p-2"
                    whileHover={{ scale: 1.5 }}
                >
                    WEB
                </MotionDiv>
                <Skill name="HTML" x="-25vw" y="2vw" />
                <Skill name="CSS" x="-5vw" y="-10vw" />
                <Skill name="JavaScript" x="20vw" y="6vw" />
                <Skill name="ReactJS" x="0vw" y="12vw" />
                <Skill name="NextJS" x="-20vw" y="-15vw" />
                <Skill name="GatsbyJS" x="15vw" y="-12vw" />
                <Skill name="Web Design" x="32vw" y="-5vw" />
                <Skill name="Figma" x="0vw" y="-20vw" />
                <Skill name="Firebase" x="-25vw" y="18vw" />
                <Skill name="Tailwind CSS" x="18vw" y="18vw" />
            </div>
        </>
    );
}

export default Skills;
