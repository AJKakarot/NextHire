"use client";

import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useAppData } from "@/context/AppContext";
import { GroqPolishToggle } from "@/components/groq-polish-toggle";

const pillPrimary =
  "min-h-[48px] w-full rounded-xl border-0 bg-brand px-6 text-sm font-medium text-ink shadow-none transition-all hover:scale-[1.03] hover:bg-brand-hover active:scale-[0.99] sm:w-auto sm:min-w-[200px] sm:px-8";

const pillOutline =
  "min-h-[48px] w-full rounded-xl border border-line bg-transparent px-6 text-sm font-medium text-ink shadow-none transition-all hover:scale-[1.03] hover:border-brand/40 hover:bg-elevated sm:w-auto sm:min-w-[160px] sm:px-8";

type HeroProps = {
  targetJob?: string;
  jobDescription?: string;
  polish?: boolean;
  onTargetJobChange?: (value: string) => void;
  onJobDescriptionChange?: (value: string) => void;
  onPolishChange?: (value: boolean) => void;
  onUploadResume?: () => void;
};

const Hero = ({
  targetJob = "",
  jobDescription = "",
  polish = true,
  onTargetJobChange,
  onJobDescriptionChange,
  onPolishChange,
  onUploadResume,
}: HeroProps) => {
  const { user, isAuth } = useAppData();
  const isRecruiter = isAuth && user?.role === "recruiter";

  if (isRecruiter) {
    return (
      <section className="mx-auto max-w-3xl px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
        <div className="relative text-center">
          <h1 className="text-[clamp(1.75rem,5vw,3rem)] font-semibold leading-tight tracking-tight text-ink">
            Hire{" "}
            <span className="text-brand">
              talent
            </span>{" "}
            faster
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-mute sm:text-base">
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
        <h1 className="mb-4 text-balance text-[clamp(1.625rem,6vw+0.35rem,3.25rem)] font-bold leading-tight tracking-tight text-ink">
          Analyze your{" "}
          <span className="text-brand">resume</span> with{" "}
          <span className="relative inline-block px-0.5">
            <span
              className="animate-glow-ai-halo pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[2em] w-[2.25em] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/25 blur-xl motion-reduce:animate-none"
              aria-hidden
            />
            <span className="animate-glow-ai-text relative inline-block text-brand motion-reduce:animate-none">
              AI
            </span>
          </span>
        </h1>

        <p className="mx-auto mb-4 max-w-md text-pretty text-sm leading-relaxed text-mute sm:max-w-lg md:max-w-xl md:text-base">
          Get ATS score and improve instantly
        </p>

        <div className="mx-auto flex w-full max-w-md flex-col items-stretch gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3">
          <Button
            type="button"
            className={pillPrimary}
            onClick={() => {
              onUploadResume?.();
              document.getElementById("resume-analyzer")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          >
            Upload Resume
          </Button>
          <Link href="/career-guide">
            <Button variant="outline" className={pillOutline}>
              Career guide
            </Button>
          </Link>
          <Link href="/jobs">
            <Button variant="outline" className={pillOutline}>
              Browse Jobs
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-line bg-elevated p-5 sm:p-6">
        <div className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="target-job" className="text-sm text-mute">
              Target job title
            </Label>
            <Input
              id="target-job"
              value={targetJob ?? ""}
              onChange={(e) => onTargetJobChange?.(e.target.value)}
              placeholder="e.g. Senior Full-Stack Engineer"
              className="h-11 rounded-xl border-line bg-canvas text-ink placeholder:text-mute"
            />
          </div>

          <div className="space-y-2 text-left">
            <Label htmlFor="job-description" className="text-sm text-mute">
              Job description
            </Label>
            <textarea
              id="job-description"
              rows={4}
              value={jobDescription ?? ""}
              onChange={(e) => onJobDescriptionChange?.(e.target.value)}
              placeholder="Paste JD → Get match & insights."
              className="w-full resize-none rounded-xl border border-line bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-mute outline-none focus-visible:border-brand/40 focus-visible:ring-1 focus-visible:ring-brand/20"
            />
          </div>

          <GroqPolishToggle
            checked={polish}
            onChange={(value) => onPolishChange?.(value)}
            hint="Uses Gemini/Groq polish to match the resume against your target role."
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
