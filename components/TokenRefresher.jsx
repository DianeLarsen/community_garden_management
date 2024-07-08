"use client";
import { useEffect } from "react";

const TokenRefresher = () => {
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      const token = request.cookies.get("token")?.value;
      console.log("no token");
      if (!token) {
        console.log("no token");
        return;
      }
      console.log("token");
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
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
      }
    }, 15 * 60 * 1000); // Refresh token every 15 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  return null;
};

export default TokenRefresher;
