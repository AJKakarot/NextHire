export function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-6xl px-3 py-12 sm:px-4 sm:py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          How it{" "}
          <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">
            works
          </span>
        </h2>
        <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base">
          Upload a resume, get an ATS score, then apply—or post roles as a
          recruiter.
        </p>
      </div>
      <div className="mt-10 flex flex-col gap-6 sm:mt-12 md:flex-row md:items-stretch md:justify-between md:gap-6">
        {[
          {
            step: "1",
            title: "Upload resume",
            body: "PDF from the landing analyzer—or complete your profile after you sign up.",
          },
          {
            step: "2",
            title: "AI analysis",
            body: "We score structure and keywords, then suggest career paths from your skills.",
          },
          {
            step: "3",
            title: "Apply or hire",
            body: "Job seekers apply in one click. Recruiters post jobs and update applicants.",
          },
        ].map((item) => (
          <div
            key={item.step}
            className="group relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.05] to-transparent p-5 text-center transition-all duration-300 ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:scale-[1.02] hover:border-orange-500/35 hover:shadow-[0_24px_48px_-16px_rgba(249,115,22,0.22)] sm:p-6 md:text-left"
          >
            <span className="relative z-[1] mx-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange-500/35 bg-orange-500/10 text-sm font-bold text-orange-400 md:mx-0">
              {item.step}
            </span>
            <h3 className="relative z-[1] mt-4 text-lg font-semibold text-white">
              {item.title}
            </h3>
            <p className="relative z-[1] mt-2 text-sm leading-relaxed text-zinc-400">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
