function Layout({ children, className }) {
  return (
    <div
      className={`w-[85vw]   ${className} m-auto bg-transparent dark:bg-transparent max-w-[1170px]`}
    >
      {children}
    </div>
  );
}

export default Layout;
