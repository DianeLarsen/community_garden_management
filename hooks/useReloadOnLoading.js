import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { parseCookies } from "nookies";

const useReloadOnLoading = (loading, isUserLoaded) => {
  const router = useRouter();
  const [token, setToken] = useState("");
  const pathname = usePathname();
  const publicPaths = ["/", "/about", "/register", "/verify"];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (isPublicPath) return
    const checkToken = () => {
      const tokenCookie = parseCookies().token;
      const localToken = localStorage.getItem("token");

      if (localToken || tokenCookie) {
        setToken(localToken || tokenCookie);
      } else {
        setTimeout(() => {
          if (!localToken && !tokenCookie) {
            router.push("/");
          }
        }, 2000); // Delay of 2000 milliseconds (2 seconds)
      }
    };

    checkToken();
  }, [router, isUserLoaded]);

  if (!token) {
    if (isPublicPath) return;
    console.log("Shouldnt be here3");
    console.log("no token");
    router.push("/"); // Redirect to home if no token
    return;
  }

  useEffect(() => {
    if (!isUserLoaded && loading) {
      const intervalId = setInterval(() => {
        window.location.reload();
      }, 10000);
      return () => clearInterval(intervalId); // Clean up the interval on component unmount or when loading changes
    }
  }, [loading]);
};

export default useReloadOnLoading;
