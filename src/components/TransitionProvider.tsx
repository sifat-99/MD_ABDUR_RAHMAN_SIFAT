"use client";

import { AnimatePresence, motion } from "framer-motion";
const MotionDiv = motion.div as any;
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TransitionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <>
            <Navbar />
            <AnimatePresence mode="wait">
                <MotionDiv key={pathname} className="h-full">
                    {children}
                </MotionDiv>
            </AnimatePresence>
            <Footer />
        </>
    );
}
