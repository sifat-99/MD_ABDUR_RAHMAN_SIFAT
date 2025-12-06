import Link from "next/link";
import Layout from "./Layout";


function Footer() {
    return (
        <footer className="w-full border-t-2 border-solid border-dark font-medium text-lg dark:text-light dark:border-light sm:text-base">
            <Layout className="py-8 flex items-center justify-between lg:flex-col lg:py-6">
                <span>2025 &copy; All Rights Reserved.</span>
                <div className="flex items-center lg:py-2">
                    Build With{" "}
                    <span className="text-primary dark:text-primaryDark text-2xl px-1">
                        &#9825;
                    </span>
                    by&nbsp;
                    <Link
                        href="https://github.com/sifat-99"
                        className="underline underline-offset-2"
                        target={"_blank"}
                    >
                        Md Abdur Rahman Sifat
                    </Link>
                </div>
                <Link
                    href="mailto:mdabdurrahmansifat@gmail.com"
                    target={"_blank"}
                    className="underline underline-offset-2"
                >
                    Say Hello
                </Link>
            </Layout>
        </footer>
    );
}

export default Footer;
