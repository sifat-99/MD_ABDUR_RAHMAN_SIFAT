import {motion} from "framer-motion"

function TransitionEffects() {
 return (
   <>
     <motion.div
       className="fixed top-0 bottom-0 right-full h-screen w-screen z-30 bg-gradient-to-r from-[#b9b4e9] via-[#b191f1] to-[#f1a5fd]"
       initial={{ x: "100%", width: "100%" }}
       animate={{ x: "0%", width: "0%" }}
       exit={{ x: ["0%", "100%"], width: ["0%", "100%"] }}
       transition={{ duration: 0.5, ease: "easeInOut" }}
     />
     <motion.div
       className="fixed top-0 bottom-0 right-full h-screen w-screen z-20 bg-light"
       initial={{ x: "100%", width: "100%" }}
       animate={{ x: "0%", width: "0%" }}
       transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
     />
     <motion.div
       className="fixed top-0 bottom-0 right-full h-screen w-screen z-10 bg-dark"
       initial={{ x: "100%", width: "100%" }}
       animate={{ x: "0%", width: "0%" }}
       transition={{ delay: 0.2, duration: 0.5, ease: "easeInOut" }}
     />
   </>
 );
}

export default TransitionEffects
