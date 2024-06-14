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
    <div className="relative">
      {isAuthenticated ? (
        <button onClick={handleSignOut} className="bg-pink-500 text-white py-2 px-6 rounded-full">
          Sign Out
        </button>
      ) : (
        <div className="relative">
          <button
            onClick={() => setIsDropdownVisible(!isDropdownVisible)}
            className="bg-pink-500 hover:bg-pink-700 duration-500 text-white py-2 px-6 rounded-full"
          >
            Sign In
          </button>
          {isDropdownVisible && (
            <div className="absolute right-0 mt-2 w-64 bg-white border rounded-md shadow-lg">
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
