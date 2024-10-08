"use client";
import { useEffect } from "react";
import { useRouter, usePathname  } from "next/navigation";

const TokenRefresher = () => {
  const router = useRouter();
  const pathname = usePathname()
  const publicPaths = ["/", "/about", "/register", "/verify", "/password-reset-request"];
  const isPublicPath = publicPaths.includes(pathname);
  


  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const token = getCookie("token") || localStorage.getItem("token");
      
      if (!token) {
        if (isPublicPath) return;

        router.push("/"); // Redirect to home if no token
        return;
      }

      try {

        const response = await fetch("/api/refresh-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem("token", data.token);
          document.cookie = `token=${data.token}; path=/;`;
        } else {
          if (isPublicPath) return;
          router.push("/"); // Redirect to home if token refresh fails
        }
      } catch (error) {
        if (isPublicPath) return;
        console.error("Failed to refresh token:", error);
        router.push("/"); // Redirect to home if there's an error
      }
    }, 15 * 60 * 1000); // Refresh token every 15 minutes

    return () => clearInterval(refreshInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  return null;
};

export default TokenRefresher;
