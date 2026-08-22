"use client";

import Hero from "@/components/hero";
import PageBackground from "@/components/page-background";
import ResumeAnalyzer, {
  type ResumeAnalyzerHandle,
} from "@/components/resume-analyser";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/context/AppContext";
import React from "react";

const startBtn =
  "h-12 rounded-full border-0 bg-brand px-10 text-sm font-medium text-ink shadow-none transition-all hover:scale-[1.03] hover:bg-brand-hover";

const TRUSTED_TEAMS = [
  "ACME",
  "NORTHWIND",
  "GLOBEX",
  "UMBRELLA",
  "STARK",
];

const Home = () => {
  const { isAuth, user } = useAppData();
  const isRecruiter = isAuth && user?.role === "recruiter";
  const [targetJob, setTargetJob] = React.useState("");
  const [jobDescription, setJobDescription] = React.useState("");
  const [polish, setPolish] = React.useState(true);
  const analyzerRef = React.useRef<ResumeAnalyzerHandle>(null);

  return (
    <div className="relative bg-canvas">
      <PageBackground />
      <Hero
        targetJob={targetJob}
        jobDescription={jobDescription}
        polish={polish}
        onTargetJobChange={setTargetJob}
        onJobDescriptionChange={setJobDescription}
        onPolishChange={setPolish}
        onUploadResume={() => analyzerRef.current?.openFilePicker()}
      />

      {isRecruiter ? (
        <section className="mx-auto max-w-3xl px-4 pb-20 pt-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              See what&apos;s hiring in the market
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-mute">
            Browse open roles. Post jobs and review applicants from your
            companies — applicants apply; you hire.
          </p>
          <div className="mt-6 flex justify-center">
            <a href="/jobs">
              <Button className={startBtn}>Browse Jobs</Button>
            </a>
          </div>
        </section>
      ) : (
        <>
          <section
            className="mx-auto max-w-3xl px-4 pb-2 sm:px-6"
            aria-label="Resume analysis pipeline"
          >
            <p className="mb-3 text-center text-sm font-medium tracking-tight text-mute md:text-base">
              Pipeline — upload to run
            </p>
            <div id="resume-analyzer" className="scroll-mt-24">
              <ResumeAnalyzer
                ref={analyzerRef}
                embedded
                polish={polish}
                targetJob={targetJob}
                jobDescription={jobDescription}
              />
            </div>
          </section>

          <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="flex flex-col items-center gap-5 text-center">
              <p className="w-full text-center text-sm leading-normal text-mute">
                <span className="font-semibold tabular-nums text-brand">
                  1,000+
                </span>{" "}
                resumes analyzed successfully
              </p>

              <div className="w-full">
                <p className="mb-3 text-xs font-medium tracking-tight text-mute sm:text-sm">
                  Trusted by teams at
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {TRUSTED_TEAMS.map((name) => (
                    <span
                      key={name}
                      className="rounded-lg border border-line bg-elevated px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-mute sm:px-5 sm:py-2.5 sm:text-xs"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-3xl px-4 pb-20 pt-4 text-center sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl">
              Get your resume reviewed in seconds
            </h2>
            <div className="mt-6 flex justify-center">
              <a href="#resume-analyzer">
                <Button className={startBtn}>Start Now</Button>
              </a>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
