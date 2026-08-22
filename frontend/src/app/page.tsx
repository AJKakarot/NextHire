"use client";

import Hero from "@/components/hero";
import Loading from "@/components/loading";
import PageBackground from "@/components/page-background";
import ResumeAnalyzer from "@/components/resume-analyser";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/AppContext";
import React from "react";

const startBtn =
  "h-12 rounded-full border-0 bg-orange-500 px-10 text-sm font-medium text-black shadow-none transition-all hover:scale-[1.03] hover:bg-orange-400";

const TRUSTED_TEAMS = [
  "ACME",
  "NORTHWIND",
  "GLOBEX",
  "UMBRELLA",
  "STARK",
];

const Home = () => {
  const { loading } = useAppData();
  if (loading) return <Loading />;

  return (
    <div className="relative bg-black">
      <PageBackground />
      <Hero />

      <section
        id="features"
        className="mx-auto max-w-3xl px-4 pb-2 sm:px-6"
        aria-label="Resume analysis pipeline"
      >
        <p className="mb-3 text-center text-sm font-medium tracking-tight text-zinc-500">
          Pipeline — upload to run
        </p>
        <div id="resume-analyzer" className="scroll-mt-24">
          <ResumeAnalyzer embedded />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center gap-5 text-center">
          <p className="text-sm font-medium text-orange-500/95">
            1,000+ resumes analyzed successfully
          </p>

          <div className="w-full">
            <p className="mb-3 text-xs font-medium tracking-tight text-zinc-500 sm:text-sm">
              Trusted by teams at
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              {TRUSTED_TEAMS.map((name) => (
                <span
                  key={name}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-500 sm:px-5 sm:py-2.5 sm:text-xs"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-20 pt-4 text-center sm:px-6">
        <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
          Get your resume reviewed in seconds
        </h2>
        <div className="mt-6 flex justify-center">
          <a href="#resume-analyzer">
            <Button className={startBtn}>Start Now</Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Home;
