"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const AuthLinks = () => {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <div className="relative flex flex-nowrap items-center gap-6">
      {isAuthenticated ? (
        <button onClick={handleSignOut} className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-pink-500 hover:to-yellow-500 duration-500 text-white py-2 px-6 rounded-full">
          Sign Out
        </button>
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
              <form className="p-4">
                <div>
                  <label>Email:</label>
                  <input
                    type="email"
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div className="mt-2">
                  <label>Password:</label>
                  <input
                    type="password"
                    className="w-full border p-2 rounded"
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
