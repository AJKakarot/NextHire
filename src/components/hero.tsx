"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAppData } from "@/context/AppContext";

const pillPrimary =
  "h-11 rounded-full border-0 bg-orange-500 px-7 text-sm font-medium text-black shadow-none transition-all hover:bg-orange-400 hover:scale-[1.02]";

const pillOutline =
  "h-11 rounded-full border border-white/20 bg-transparent px-7 text-sm font-medium text-white shadow-none transition-all hover:border-white/35 hover:bg-white/[0.04] hover:scale-[1.02]";

const Hero = () => {
  const { user, isAuth } = useAppData();
  const isRecruiter = isAuth && user?.role === "recruiter";

  if (isRecruiter) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <div className="relative text-center">
          <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-white">
            Hire{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
              talent
            </span>{" "}
            faster
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
            Browse open roles, post jobs, and manage applicants. No resume
            analyzer or applications from this account.
          </p>
          <div className="mx-auto mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center sm:gap-3">
            <Link href="/jobs" className="sm:w-auto">
              <Button className={`w-full sm:w-auto ${pillPrimary}`}>
                Browse Jobs
              </Button>
            </Link>
            <Link href="/account" className="sm:w-auto">
              <Button
                variant="outline"
                className={`w-full sm:w-auto ${pillOutline}`}
              >
                My companies
              </Button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 pb-4 pt-10 sm:px-6 sm:pt-14">
      <div className="relative text-center">
        <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-white">
          Analyze your{" "}
          <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
            resume
          </span>{" "}
          with{" "}
          <span className="relative inline-block">
            <span
              className="animate-glow-ai-halo pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[2em] w-[2.25em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/25 blur-xl motion-reduce:animate-none"
              aria-hidden
            />
            <span className="animate-glow-ai-text relative inline-block bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text font-semibold text-transparent motion-reduce:animate-none">
              AI
            </span>
          </span>
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm text-zinc-400 sm:text-base">
          Get ATS score, then find and apply to jobs
        </p>

        <div className="mx-auto mt-6 flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Link href="/jobs" className="sm:w-auto">
            <Button className={`w-full sm:w-auto ${pillPrimary}`}>
              Browse Jobs
            </Button>
          </Link>
          <Link href="/career-guide" className="sm:w-auto">
            <Button
              variant="outline"
              className={`w-full sm:w-auto ${pillOutline}`}
            >
              Career guide
            </Button>
          </Link>
          <a href="#resume-analyzer" className="sm:w-auto">
            <Button
              variant="outline"
              className={`w-full sm:w-auto ${pillOutline}`}
            >
              Upload Resume
            </Button>
          </a>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <div className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="target-job" className="text-sm text-zinc-400">
              Target job title
            </Label>
            <Input
              id="target-job"
              placeholder="e.g. Senior Full-Stack Engineer"
              className="h-11 rounded-xl border-white/10 bg-black/40 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="job-description" className="text-sm text-zinc-400">
              Job description
            </Label>
            <textarea
              id="job-description"
              rows={4}
              placeholder="Paste JD → Get match & insights."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus-visible:border-orange-500/40 focus-visible:ring-1 focus-visible:ring-orange-500/20"
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 text-left text-sm text-zinc-400">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-black/40 accent-orange-500"
            />
            <span>
              Add{" "}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text font-medium text-transparent">
                Gemini
              </span>{" "}
              polish.
            </span>
          </label>
        </div>
      </div>
    </section>
  );
};

export default Hero;
