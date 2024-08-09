"use client";
import Link from "next/link";
import AuthLinks from "@/components/AuthLinks";
import { IoMdMenu } from "react-icons/io";
import { useState, useContext } from "react";
import { BasicContext } from "@/context/BasicContext";

const NavBar = () => {
  const [menuToggle, setMenuToggle] = useState("menu");

  const {
    isAuthenticated,
    setIsAuthenticated,
    banner,
    setBanner,
    setUser, 
    showBanner
  } = useContext(BasicContext);

  const navLinks = isAuthenticated
    ? [
        { href: "/", label: "Home" },
        { href: "/events", label: "Events" },
        { href: "/gardens", label: "Gardens" },
        { href: "/groups", label: "Groups" },
        { href: "/about", label: "About" },
      ]
    : [
        { href: "/", label: "Home" },
        { href: "/about", label: "About" },
      ];

  return (
    <>
      <nav className="flex bg-gray-800 text-white py-2 items-center justify-between w-[92%] mx-auto text-lg md:text-lg lg:text-xl  min-[1406px]:text-xl max-[1536px]:text-2xl min-[1536px]:text-2xl">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="hidden md:hidden lg:hidden xl:flex text-white font-bold"
          >
            Community Garden Management
          </Link>
          <Link
            href="/"
            title="Community Garden Management"
            className="xl:hidden text-white text-2xl font-bold"
          >
            CGM
          </Link>
        </div>
        <div
          className={`nav-links md:static absolute bg-gray-800 duration-500 md:min-h-fit min-h-[40vh] md:right-0 ${
            menuToggle === "menu"
              ? "top-[-100%] right-0"
              : "top-[7%] right-0 w-half"
          } md:w-auto w-6/12 flex items-center px-6`}
        >
          <ul className={`flex md:flex-row flex-col md:items-center text-white font-bold md:gap=[4vw] gap-7`}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuToggle("menu")}
                  className="px-4"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-nowrap items-center gap-6">
          <IoMdMenu
            className="text-3xl cursor-pointer md:hidden"
            name={menuToggle}
            onClick={() =>
              setMenuToggle(menuToggle === "menu" ? "close" : "menu")
            }
          />
          <AuthLinks
            setIsAuthenticated={setIsAuthenticated}
            isAuthenticated={isAuthenticated}
            showBanner={showBanner}
          />
        </div>
      </nav>
      {banner.message && (
        <div
          className={`${
            banner.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white text-center top-[%9%]`}
        >
          {banner.message}{" "}
          {banner.link && (
            <Link href={banner.link} className="text-black underline">
              Click here to fix
            </Link>
          )}
          <button
            onClick={() => setBanner({ message: "", type: "" })}
            className="ml-4"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
};

export default NavBar;
