import type { Metadata } from 'next'
import '@/styles/globals.css'
import Script from 'next/script'
import TransitionProvider from '@/components/TransitionProvider'

export const metadata: Metadata = {
    title: 'MD: ABDUR RAHMAN SIFAT',
    description: 'Created by sifat khan',
    icons: {
        icon: '/Sifat.svg',
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <head>
                <Script id="theme-switcher" strategy="beforeInteractive">
                    {`
              if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark')
              } else {
                document.documentElement.classList.remove('dark')
              }
            `}
                </Script>
            </head>
            <body className={`font-serif bg-gradient-to-r from-[#b9b4e9] via-[#b191f1] to-[#f1a5fd] dark:bg-gradient-to-r dark:from-[#191919] dark:via-[#040304] dark:to-[#000000] w-full min-h-screen animate-gradient bg-[length:400%_400%]`}>
                <Script
                    strategy="afterInteractive"
                    src="https://www.googletagmanager.com/gtag/js?id=G-RD0TN8SP2K"
                />
                <Script id="google-analytics" strategy="afterInteractive">
                    {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-RD0TN8SP2K');
        `}
                </Script>
                <TransitionProvider>
                    {children}
                </TransitionProvider>
            </body>
        </html>
    )
}
