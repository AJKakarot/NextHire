import { cn } from "@/lib/utils";

export type FeatureCardVariant = "default" | "featured" | "pro";

export type FeatureCardProps = {
  tag: string;
  title: string;
  description: string;
  icon: string;
  variant?: FeatureCardVariant;
  className?: string;
};

export function FeatureCard({
  tag,
  title,
  description,
  icon,
  variant = "default",
  className,
}: FeatureCardProps) {
  const isAccent = variant === "featured" || variant === "pro";

  return (
    <div
      className={cn(
        "group relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-out will-change-transform sm:p-6",
        "motion-safe:hover:-translate-y-1 motion-reduce:hover:translate-y-0",
        "active:scale-[0.99] active:duration-150",
        !isAccent &&
          "border border-line bg-elevated hover:border-brand/30 motion-safe:hover:scale-[1.02] hover:shadow-[0_0_28px_rgba(0,0,0,0.35),0_18px_36px_-14px_rgba(0,0,0,0.45)]",
        isAccent &&
          "border border-brand/40 bg-gradient-to-b from-brand/[0.08] to-transparent shadow-[0_0_50px_-18px_rgba(249,115,22,0.35)] hover:border-brand-hover/60 motion-safe:hover:scale-[1.03] hover:shadow-[0_0_48px_-12px_rgba(249,115,22,0.42),0_22px_44px_-18px_rgba(0,0,0,0.55)]",
        "motion-reduce:hover:scale-100",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-xl text-[1.35rem] leading-none transition-transform duration-200 motion-safe:group-hover:scale-105 sm:h-11 sm:w-11 sm:text-[1.5rem]",
            !isAccent && "bg-canvas ring-1 ring-inset ring-line",
            isAccent && "bg-brand/15 ring-1 ring-inset ring-brand/25"
          )}
          aria-hidden
        >
          {icon}
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mute transition-colors duration-200 group-hover:text-ink">
            {tag}
          </p>
          <h3 className="text-base font-semibold leading-snug tracking-tight text-ink sm:text-lg">
            {title}
          </h3>
          <p
            className="line-clamp-2 text-sm leading-relaxed text-mute transition-colors duration-200 group-hover:text-ink"
            title={description}
          >
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
