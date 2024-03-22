import { motion } from "framer-motion";

function Skill({ name, x, y }) {
  return (
    <motion.div
      className="flex items-center justify-center rounded-full font-semibold bg-black text-light py-3 px-3 absolute dark:bg-light dark:text-dark md:py-1.5 md:px-3 xs:bg-transparent  lg:py-2 lg:px-4 md:text-sm xs:dark:bg-transparent xs:text-dark xs:dark:text-light xs:font-bold lg:p-6 md:p-4 xs:text-xs xs:p-2"
      whileHover={{ scale: 1.5 }}
      initial={{ x: 0, y: 0 }}
      whileInView={{ x: x, y: y }}
      transition={{ duration: 1.5 }}
    >
      {name}
    </motion.div>
  );
}
function Skills() {
  return (
    <>
      <h2 className="font-bold text-4xl mt-64 w-full text-center dark:text-light md:text-6xl md:mt-32 ">
        Skills
      </h2>
      <div className="w-full h-screen lg:h-[80vh] sm:h-[60vh] xs:h-[50vh] relative rounded-full justify-center flex items-center bg-circularLight dark:bg-circularDark
       lg:bg-circularLightLg lg:dark:bg-circularDarkLg
       md:bg-circularLightMd md:dark:bg-circularDarkMd
       sm:bg-circularLightSm sm:dark:bg-circularDarkSm
        ">
        <motion.div
          className="flex items-center justify-center rounded-full font-semibold bg-black text-light py-4 px-4 dark:bg-light dark:text-dark"
          whileHover={{ scale: 1.5 }}
        >
          web
        </motion.div>
        <Skill name="HTML" x="-25vw" y="2vw" />
        <Skill name="CSS" x="-5vw" y="-10vw" />
        <Skill name="javascript" x="20vw" y="6vw" />
        <Skill name="reactjs" x="0vw" y="12vw" />
        <Skill name="web design" x="32vw" y="-5vw" />
        <Skill name="supa base" x="-25vw" y="18vw" />
        <Skill name="tailwind" x="22vw" y="22vw" />
      </div>
    </>
  );
}

export default Skills;
