import React from 'react';

function Layout({ children, className = "" }) {
    return (
        <div
            className={`w-full h-full inline-block z-0 bg-transparent p-32 dark:bg-transparent xl:p-24 lg:p-16 md:p-12 sm:p-8 ${className}`}
        >
            {children}
        </div>
    );
}

export default Layout;
