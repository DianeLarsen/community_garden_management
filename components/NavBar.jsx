"use client";
import Link from "next/link";
import AuthLinks from "@/components/AuthLinks";
import { IoMdMenu } from "react-icons/io";
import { useState } from "react";

const NavBar = () => {
  const [menuToggle, setMenuToggle] = useState("menu");
  const [banner, setBanner] = useState({ message: "", type: "" });

  const showBanner = (message, type) => {
    setBanner({ message, type });
    setTimeout(() => setBanner({ message: "", type: "" }), 30000); // Hide banner after 3 seconds
  };

  return (
    <>
      <nav className="flex bg-gray-800 text-white py-2 items-center justify-between w-[92%] mx-auto text-lg md:text-lg lg:text-xl  min-[1406px]:text-xl max-[1536px]:text-2xl min-[1536px]:text-2xl">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="hidden md:hidden lg:hidden xl:flex text-white  font-bold"
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
          className={`nav-links md:static absolute bg-gray-800 duration-500  md:min-h-fit min-h-[40vh] md:right-0 ${
            menuToggle == "menu"
              ? "top-[-100%] right-0"
              : "top-[7%] right-0 w-half"
          } md:w-auto w-6/12 flex items-center px-6`}
        >
          <ul
            className={`flex md:flex-row flex-col md:items-center text-white  font-bold md:gap=[4vw] gap-7`}
          >
            <li>
              <Link href="/" className="px-4">
                Home
              </Link>
            </li>
            <li>
              <Link href="/plots" className="px-4">
                Plots
              </Link>
            </li>
            <li>
              <Link href="/events" className="px-4">
                Events
              </Link>
            </li>
            <li>
              <Link href="/weather" className="px-4">
                Weather
              </Link>
            </li>
            <li>
              <Link href="/community-gardens" className="px-4">
                Gardens
              </Link>
            </li>
            <li>
              <Link href="/groups" className="px-4">
                Groups
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-nowrap items-center gap-6">
          <IoMdMenu
            className="text-3xl cursor-pointer md:hidden"
            name={menuToggle}
            onClick={() =>
              setMenuToggle(menuToggle == "menu" ? "close" : "menu")
            }
          />
          <AuthLinks showBanner={showBanner} />
        </div>
      </nav>
      {banner.message && (
        <div
          className={`${
            banner.type === "error" ? "bg-red-500" : "bg-green-500"
          } text-white text-center top-[%9%]`}
        >
          {banner.message}{" "}
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
