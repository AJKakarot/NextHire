"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { LogOut, Menu, User, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useAppData } from "@/context/AppContext";
import SiteLogo from "./site-logo";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const navLinkClass =
  "shrink-0 cursor-pointer whitespace-nowrap px-3 py-2 text-sm font-medium text-mute transition-colors hover:text-ink";

const loginBtnClass =
  "h-9 rounded-full border border-line bg-elevated px-4 text-xs font-medium text-ink shadow-none transition-all hover:border-brand/40 hover:bg-elevated sm:h-10 sm:px-5 sm:text-sm";

const signupBtnClass =
  "h-9 rounded-full border-0 bg-brand px-4 text-xs font-medium text-ink shadow-none transition-all hover:bg-brand-hover sm:h-10 sm:px-5 sm:text-sm";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { isAuth, user, loading, logoutUser } = useAppData();
  const isRecruiter = isAuth && user?.role === "recruiter";

  const navLinks = isRecruiter
    ? []
    : [
        { href: "/features", label: "Features" },
        { href: "/subscribe", label: "Pricing" },
      ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="site-navbar"
      className={cn(
        "sticky top-0 z-50 w-full border-b border-line backdrop-blur-md transition-all duration-300 ease-out",
        scrolled ? "bg-canvas/90" : "bg-canvas/70"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <SiteLogo />

        <nav
          className="hidden min-w-0 flex-1 justify-center gap-1 md:flex md:gap-6"
          aria-label="Primary"
        >
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={navLinkClass}>
              {label}
            </Link>
          ))}
        </nav>

        <div className="hidden h-10 min-w-[148px] shrink-0 items-center justify-end gap-2 md:flex">
          {loading ? (
            <div className="h-10 w-[148px] rounded-full bg-elevated" />
          ) : (
            <>
              {isAuth ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center gap-2 transition-opacity hover:opacity-80">
                      <Avatar className="h-9 w-9 cursor-pointer ring-2 ring-white/10 ring-offset-2 ring-offset-black transition-all hover:ring-orange-500/30">
                        <AvatarImage
                          src={user ? (user.profile_pic as string) : ""}
                          alt={user ? user.name : ""}
                        />
                        <AvatarFallback className="bg-white/[0.06] text-zinc-300">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 border-line bg-elevated p-2"
                    align="end"
                  >
                    <div className="mb-2 border-b border-line px-3 py-2">
                      <p className="text-sm font-semibold text-ink">
                        {user && user.name}
                      </p>
                      <p className="truncate text-xs text-mute">
                        {user && user.email}
                      </p>
                    </div>
                    <Link href="/account">
                      <Button
                        className="w-full justify-start gap-2"
                        variant="ghost"
                      >
                        <User size={16} /> My Profile
                      </Button>
                    </Link>
                    <Button
                      className="mt-1 w-full justify-start gap-2"
                      variant="ghost"
                      onClick={logoutUser}
                    >
                      <LogOut size={16} />
                      Logout
                    </Button>
                  </PopoverContent>
                </Popover>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className={loginBtnClass}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button className={signupBtnClass}>Signup</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto rounded-lg p-2 transition-colors hover:bg-white/[0.06] md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-line transition-all duration-300 ease-out md:hidden",
          isOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="space-y-1 bg-canvas px-4 py-3 backdrop-blur-md">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setIsOpen(false)}>
              <Button variant="ghost" className="h-11 w-full justify-start">
                {label}
              </Button>
            </Link>
          ))}
          {isAuth ? (
            <>
              <Link href="/account" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="h-11 w-full justify-start gap-3">
                  <User size={18} /> My Profile
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="h-11 w-full justify-start gap-3 text-danger"
                onClick={() => {
                  logoutUser();
                  setIsOpen(false);
                }}
              >
                <LogOut size={18} /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  className="mt-1 h-11 w-full rounded-full"
                >
                  Login
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="h-11 w-full rounded-full">Signup</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
