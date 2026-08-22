import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { ArrowRight } from "lucide-react";
import PageBackground from "@/components/page-background";
import { glassCardSm } from "@/lib/brand";

const About = () => {
  const steps = [
    {
      n: "01",
      title: "Discover",
      desc: "Browse SDE roles, analyze your resume, and get AI career guidance.",
    },
    {
      n: "02",
      title: "Apply",
      desc: "Create your profile, upload resume, and apply to matching jobs.",
    },
    {
      n: "03",
      title: "Grow",
      desc: "Track applications, improve your ATS score, and level up skills.",
    },
  ];

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <section className="relative mx-auto max-w-6xl px-4 py-16 md:py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
            About NextHire
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Our mission at NextHire
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-zinc-400">
            We connect talented engineers with forward-thinking companies — with
            AI tools that help you stand out before you apply.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className={`${glassCardSm} p-6`}>
              <p
                className="font-display text-3xl font-bold text-orange-400/90"
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {step.n}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-400">{step.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div className={`${glassCardSm} p-6`}>
            <h3 className="text-lg font-semibold text-orange-300">
              For Job Seekers
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Resume analyzer, career guide, job search, and application tracking
              in one place.
            </p>
          </div>
          <div className={`${glassCardSm} p-6`}>
            <h3 className="text-lg font-semibold text-orange-300">
              For Recruiters
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              Post jobs, manage companies, and review applicants with a streamlined
              workflow.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-semibold text-white md:text-4xl">
            Ready to find your dream job?
          </h2>
          <p className="mt-3 text-zinc-400">
            Join thousands of engineers on NextHire
          </p>
          <div className="pt-6">
            <Link href="/jobs">
              <Button size="lg" className="gap-2 px-8">
                Get Started
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
