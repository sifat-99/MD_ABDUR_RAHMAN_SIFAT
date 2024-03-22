import { useEffect, useState } from "react";

function useDarkTheme() {
  const [mode, setMode] = useState("");
  useEffect(() => {
   const preferDarkTheme = "(prefer-color-scheme:dark)";
   const userPref = window.localStorage.getItem("theme");
    const handleTheme = function () {
      if (userPref) {
        let check = userPref === "dark" ? "dark" : "light";
        setMode(check);
        if (check === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        let check = mediaQuery.matches ? "dark" : "light";
        setMode(check);
        if (check === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
      return () => mediaQuery.addEventListener("change", handleTheme);
    };
    const mediaQuery = window.matchMedia(preferDarkTheme);
    mediaQuery.addEventListener("change", handleTheme);
    handleTheme();
  }, []);

  useEffect(() => {
    if (mode == "dark") {
      window.localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
     }if(mode==="light"){
     window.localStorage.setItem("theme", "light");
     document.documentElement.classList.remove("dark");

    }
   }, [mode]);
   return [mode,setMode]
  // return <div></div>;
}

export default useDarkTheme;
