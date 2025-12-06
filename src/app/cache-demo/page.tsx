import React, { Suspense } from 'react';
import { cacheLife } from 'next/cache';

// Simulate a slow database fetch
async function getData() {
    'use cache';
    cacheLife('blog'); // Use the 'blog' profile we defined in next.config.js

    await new Promise((resolve) => setTimeout(resolve, 2000));
    return {
        timestamp: new Date().toISOString(),
        message: 'This data was cached!',
    };
}

export default async function CacheDemoPage() {
    const data = await getData();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
            <h1 className="text-4xl font-bold mb-8">Cache Demo</h1>

            <div className="p-8 border rounded-lg bg-gray-100 dark:bg-gray-800">
                <h2 className="text-2xl mb-4">Cached Data</h2>
                <p className="text-lg mb-2">Message: <span className="font-semibold text-green-600">{data.message}</span></p>
                <p className="text-lg">Generated at: <span className="font-mono text-purple-600">{data.timestamp}</span></p>
                <p className="text-sm mt-4 text-gray-500">
                    Refresh the page. If the timestamp stays the same, it means the result was cached.
                </p>
            </div>

            <div className="mt-8">
                <form>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Revalidate
                    </button>
                </form>
            </div>
        </div>
    );
}
