"use client";
import Link from "next/link";
import AuthLinks from "@/components/AuthLinks";
import { IoMdMenu } from "react-icons/io";
import { useState } from "react";

const NavBar = () => {
  const [menuToggle, setMenuToggle] = useState("menu");
  // console.log(menuToggle)

  return (
    <nav className="flex items-center justify-between w-[92%] mx-auto">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href="/"
          className="hidden md:hidden lg:flex text-white lg:text-2xl font-bold"
        >
          Community Garden Management
        </Link>
        <Link
          href="/"
          title="Community Garden Management"
          className="lg:hidden text-white text-2xl font-bold"
        >
          CGM
        </Link>
      </div>
      <div
        className={`nav-links md:static absolute bg-gray-800 duration-500  md:min-h-fit min-h-[60vh] md:right-0 ${
          menuToggle == "menu"
            ? "top-[-100%] right-0"
            : "top-[9%] right-0 w-half"
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
            <Link href="/plot-reservation" className="px-4">
              Plots
            </Link>
          </li>
          <li>
            <Link href="/event-calendar" className="px-4">
              Events
            </Link>
          </li>
          <li>
            <Link href="/weather-updates" className="px-4">
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

      <div className="flex items-center gap-6">
        <AuthLinks />
        <IoMdMenu
          className="text-3xl cursor-pointer md:hidden"
          name={menuToggle}
          onClick={() => setMenuToggle(menuToggle == "menu" ? "close" : "menu")}
        />
      </div>
    </nav>
  );
};

export default NavBar;
