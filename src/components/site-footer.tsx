"use client";

import Link from "next/link";
import SiteLogo from "./site-logo";
import { useAppData } from "@/context/AppContext";

const SiteFooter = () => {
  const { isAuth, user } = useAppData();
  const isRecruiter = isAuth && user?.role === "recruiter";

  return (
    <footer className="relative z-10 mt-6 border-t border-white/[0.06] bg-black text-base-content">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <SiteLogo />

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            {isRecruiter ? (
              <Link
                href="/jobs"
                className="font-medium text-zinc-400 transition-colors hover:text-white"
              >
                Browse Jobs
              </Link>
            ) : (
              <>
                <Link
                  href="/features"
                  className="font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Features
                </Link>
                <Link
                  href="/subscribe"
                  className="font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  Pricing
                </Link>
              </>
            )}
            <Link
              href="/about"
              className="font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Docs
            </Link>
          </nav>

          {!isRecruiter && (
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-white/15 bg-white/[0.04] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400 md:text-[11px]">
                ATS
              </span>
              <span className="rounded-full border border-orange-500/30 bg-orange-500/[0.08] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-orange-400/90 md:text-[11px]">
                AI-powered
              </span>
            </div>
          )}

          <p className="text-xs font-normal tracking-wide text-zinc-600">
            © {new Date().getFullYear()} NextHire · Built by{" "}
            <a
              href="https://ajeetgupta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 transition-colors hover:text-orange-400"
            >
              Ajeet
            </a>{" "}
            Gupta
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
