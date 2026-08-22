import Link from "next/link";
import { LANDING_FEATURES } from "@/data/features";
import {
  FeatureCard,
  type FeatureCardVariant,
} from "@/components/landing/FeatureCard";

function layoutToVariant(
  layout: (typeof LANDING_FEATURES)[number]["layout"]
): FeatureCardVariant {
  if (layout === "hero") return "featured";
  if (layout === "pro") return "pro";
  return "default";
}

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative overflow-hidden border-t border-line bg-canvas py-12 sm:py-16 md:py-20"
      aria-labelledby="features-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_60%_at_50%_0%,rgba(249,115,22,0.12),transparent_55%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/35 to-transparent"
        aria-hidden
      />

      <div className="relative z-[1] mx-auto max-w-6xl px-3 sm:px-4 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="features-heading"
            className="text-lg font-medium uppercase tracking-[0.08em] text-ink sm:text-xl md:text-2xl"
          >
            Smarter hiring
          </h2>
          <p className="mt-3 text-sm text-mute sm:mt-4 sm:text-base">
            ATS scan, job applications, career guide—optional{" "}
            <span className="text-info">Gemini/Groq</span> polish.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 items-stretch gap-5 sm:mt-12 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {LANDING_FEATURES.map((f) => (
            <FeatureCard
              key={f.title}
              tag={f.tag}
              title={f.title}
              description={f.description}
              icon={f.icon}
              variant={layoutToVariant(f.layout)}
            />
          ))}
        </div>

        <p className="mx-auto mt-12 max-w-lg text-center text-xs leading-relaxed text-mute sm:mt-14">
          Free includes jobs, resume analysis, and career guide. Pro adds
          visibility and{" "}
          <span className="text-info">Gemini/Groq</span> polish.{" "}
          <Link
            href="/subscribe"
            className="font-medium text-info underline-offset-2 transition-colors hover:text-brand-hover hover:underline"
          >
            Compare plans
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
