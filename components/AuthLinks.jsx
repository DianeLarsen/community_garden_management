"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const AuthLinks = ({ showBanner }) => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/community-garden/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      localStorage.setItem("token", data.token);
      setIsAuthenticated(true);
      showBanner("Login successful!", "success");
      setIsDropdownVisible(false);
    } catch (error) {
      showBanner(error.message, "error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    showBanner("Logout successful!", "success");
  };

  return (
    <div className="relative flex flex-nowrap items-center gap-6">
      {isAuthenticated ? (
        <div className="relative">
          <Image
            src="https://media.gettyimages.com/id/1572226738/vector/abstract-avatar-icon-profile-diverse-empty-face-for-social-network-and-applications-vector.jpg?s=612x612&w=gi&k=20&c=jb59dCGEzMHpKCpu2jseT5waIqAfiS3PyhE7KreoCAg="
            alt="Profile"
            className="cursor-pointer"
            width={40}
            height={40}
            style={{ height: 'calc(100% - 0.5rem)', margin: '0.25rem 0' }}
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
          />
          {isDropdownVisible && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <Link
                href="/profile"
                className="block px-4 py-2 text-gray-800 hover:bg-gray-200"
              >
                Profile
              </Link>
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
              <form className="p-4" onSubmit={handleLogin}>
                <div>
                  <label className="text-blue-500">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-blue-500 border p-2 rounded"
                    required
                  />
                </div>
                <div className="mt-2">
                  <label className="text-blue-500">Password:</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-blue-500 border p-2 rounded"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 bg-blue-500 text-white p-2 rounded"
                >
                  Sign In
                </button>
              </form>
              <Link
                className="block p-2 text-center text-blue-500"
                href="/register"
              >
                Not yet a member? Register here
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthLinks;
