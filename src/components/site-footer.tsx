"use client";

import Link from "next/link";
import SiteLogo from "./site-logo";
import { useAppData } from "@/context/AppContext";

const SiteFooter = () => {
  const { isAuth, user } = useAppData();
  const isRecruiter = isAuth && user?.role === "recruiter";

  return (
    <footer className="relative z-10 mt-6 border-t border-line bg-canvas text-ink">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col items-center gap-5 text-center">
          <SiteLogo />

          <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm">
            {isRecruiter ? (
              <Link
                href="/jobs"
                className="font-medium text-mute transition-colors hover:text-ink"
              >
                Browse Jobs
              </Link>
            ) : (
              <>
                <Link
                  href="/features"
                  className="font-medium text-mute transition-colors hover:text-ink"
                >
                  Features
                </Link>
                <Link
                  href="/subscribe"
                  className="font-medium text-mute transition-colors hover:text-ink"
                >
                  Pricing
                </Link>
              </>
            )}
            <Link
              href="/about"
              className="font-medium text-mute transition-colors hover:text-ink"
            >
              Docs
            </Link>
          </nav>

          {!isRecruiter && (
            <div className="flex flex-wrap justify-center gap-2">
              <span className="rounded-full border border-line bg-elevated px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-mute md:text-[11px]">
                ATS
              </span>
              <span className="rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-brand md:text-[11px]">
                AI-powered
              </span>
            </div>
          )}

          <p className="text-xs font-normal tracking-wide text-mute">
            © {new Date().getFullYear()} NextHire · Built by{" "}
            <a
              href="https://ajeetgupta.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-info transition-colors hover:text-brand-hover"
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
