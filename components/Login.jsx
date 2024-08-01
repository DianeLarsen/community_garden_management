"use client";
import { useState, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { isAuthenticated, setIsAuthenticated, showBanner, setIsDropdownVisible } =
    useContext(BasicContext);

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
      setEmail(data.email);
      setIsAuthenticated(true);
      showBanner("Login successful!", "success");
      setIsDropdownVisible(false);
      router.push("/profile");
    } catch (error) {
      showBanner(error.message, "error");
    }
  };

  return (
    <>
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
      <p className="text-black text-center">Not yet a member?</p>
      <Link className="block p-2 text-center text-blue-500 underline" href="/register" onClick={() => setIsDropdownVisible(false)}>
         Register here
      </Link>
      <p className="text-black text-center">Forgot your password? </p>
      <Link className="block p-2 text-center text-blue-500 underline" href="/password-reset-request" onClick={() => setIsDropdownVisible(false)}>
        Reset it here
      </Link>
    </>
  );
};

export default Login;
