/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
    },
    cacheLife: {
        "blog": {
            stale: 3600, // 1 hour
            revalidate: 900, // 15 minutes
            expire: 86400, // 1 day
        },
    },
    cacheComponents: true,
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.ibb.co",
            },
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
            },
            {
                protocol: "https",
                hostname: "skillicons.dev",
            },
            {
                protocol: "https",
                hostname: "i.giphy.com",
            },
            {
                protocol: "https",
                hostname: "i.ibb.co.com",
            },
        ],
    },
}

module.exports = nextConfig
