"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa6";
import { IoMdMenu, IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { UserSlicePath } from "@/app/redux/slices/UserSlice";
import { useMainContext } from "@/context/MainContext";
import ProfileButton from "./auth/ProfileButton";
import LogoComponent from "./reuseable/LogoComponent";
import { usePathname } from "next/navigation";
import { private_routes } from "@/utils/constant";

const Header = () => {
  const user = useSelector(UserSlicePath);
  const { logoutHandler } = useMainContext();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/service", label: "Services" },
    { href: "/all-categories", label: "Categories" },
    { href: "/matchmaker", label: "AI Matchmaker" },
    { href: "/budget", label: "Budget" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all border-b ${isScrolled ? "bg-white/95 shadow-sm border-zinc-200" : "bg-white/90 backdrop-blur border-zinc-100"}`}>
      <div className="container mx-auto flex items-center justify-between px-4 py-3 gap-x-4">
        {/* Logo & Mobile Menu Button */}
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-3xl text-black lg:hidden p-2 -ml-2"
            aria-label="Open navigation menu"
          >
            {mobileMenuOpen ? <IoMdClose /> : <IoMdMenu />}
          </button>
          <LogoComponent />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-x-5">
          {navLinks.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} active={pathname === item.href} />
          ))}
        </nav>

        {/* Auth Section */}
        {user && user.email ? (
          <ProfileButton />
        ) : (
          <div className="flex items-center gap-x-3">
          <Link
            href="/register"
            className="hidden sm:inline-flex px-5 py-3 border border-indigo-500 text-indigo-600 rounded-sm items-center gap-x-2"
          >
            <span>Register</span>
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-indigo-500 text-white rounded-sm flex items-center gap-x-2"
          >
            <span>Login</span> <FaArrowRight />
          </Link>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity lg:hidden ${
          mobileMenuOpen ? "block" : "hidden"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      ></div>
      <aside
        className={`fixed top-0 left-0 h-full w-[290px] bg-white shadow-xl transform transition-transform lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 flex flex-col gap-y-3">
          <div className="mb-3 flex items-center justify-between">
            <LogoComponent />
            <button className="text-3xl text-zinc-700" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu">
              <IoMdClose />
            </button>
          </div>
          {navLinks.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} active={pathname === item.href} onClick={() => setMobileMenuOpen(false)} />
          ))}
          {!user?.email && (
            <>
              <NavLink href="/login" label="Login" onClick={() => setMobileMenuOpen(false)} />
              <NavLink href="/register" label="Register" onClick={() => setMobileMenuOpen(false)} />
            </>
          )}
        </div>
      </aside>
    </header>
  );
};

// Reusable NavLink Component
const NavLink = ({ href, label, active, onClick }) => (
  <Link href={href} onClick={onClick} className={`flex items-center gap-x-2 rounded-md px-3 py-2 text-sm font-pmedium transition-colors ${active ? 'bg-orange-50 text-logo' : 'text-zinc-800 hover:bg-zinc-100 hover:text-logo'}`}>
    {label}
  </Link>
);

export default Header;
