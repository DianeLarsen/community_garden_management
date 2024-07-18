"use client";
import { useState, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import { BasicContext } from "@/context/BasicContext";
import Login from "./Login";

const AuthLinks = () => {
  const {
    user,
    isAuthenticated,
    setIsAuthenticated,
    showBanner,
    isDropdownVisible,
    setIsDropdownVisible,
  } = useContext(BasicContext);

  const router = useRouter();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const { exp } = jwtDecode(token);
      if (exp * 1000 < Date.now()) {
        // Token has expired
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        showBanner("Session expired. Please log in again.", "error");
      } else {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    await fetch("/api/logout", { method: "POST" });
    showBanner("Logout successful!", "success");
    setIsDropdownVisible(!isDropdownVisible);
    router.push("/");
  };
if (!user){
  return <p>Loading...</p>
}
  return (
    <div className="relative flex flex-nowrap items-center gap-6">
      {isAuthenticated ? (
        <div className="relative">
          <div
            className="flex items-center w-12 h-12 cursor-pointer"
            title={user?.email}
          >
            <Image
              src="https://media.gettyimages.com/id/1572226738/vector/abstract-avatar-icon-profile-diverse-empty-face-for-social-network-and-applications-vector.jpg?s=612x612&w=gi&k=20&c=jb59dCGEzMHpKCpu2jseT5waIqAfiS3PyhE7KreoCAg="
              alt={`Profile for ${user?.email}`}
              className="rounded-full cursor-pointer object-cover border-double border-4 border-blue-600"
              fill={true}
              title={user?.email}
              // width={120}
              // height={120}
              onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            />
          </div>
          {isDropdownVisible && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10">
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                {`Profile for ${user?.username || user?.email}`}
              </Link>
              {user?.role == 'admin' && <Link href="/admin"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Admin page</Link>}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex flex-nowrap items-center gap-6">
          <button
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            type="button"
            className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 duration-1000 text-white py-2 px-6 rounded-full whitespace-nowrap"
          >
            Sign In
          </button>
          {isDropdownVisible && (
            <div className="absolute right-0 top-12 mt-2 w-64 bg-white border rounded-md shadow-lg">
              <Login />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthLinks;
