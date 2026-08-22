export type LandingFeatureLayout = "hero" | "pro" | "default";

export type LandingFeatureItem = {
  icon: string;
  title: string;
  description: string;
  tag: string;
  layout?: LandingFeatureLayout;
};

export const LANDING_FEATURES: readonly LandingFeatureItem[] = [
  {
    icon: "📄",
    tag: "ATS",
    title: "Optimization that parsers understand",
    description:
      "Structure, headings, and keywords tuned for applicant tracking systems—so your resume survives the first filter.",
    layout: "hero",
  },
  {
    icon: "⚡",
    tag: "Jobs",
    title: "Browse and apply fast",
    description:
      "Search roles, filter by title and location, and apply with your saved resume in a few clicks.",
    layout: "default",
  },
  {
    icon: "✨",
    tag: "Rewrites",
    title: "Actionable suggestions",
    description:
      "Concrete bullet tweaks and phrasing you can paste into your resume the same day.",
    layout: "default",
  },
  {
    icon: "🎯",
    tag: "Recruiters",
    title: "Post jobs and manage applicants",
    description:
      "Create a company, publish openings, and update application status from one dashboard.",
    layout: "default",
  },
  {
    icon: "🔒",
    tag: "Privacy",
    title: "Private by default",
    description:
      "Your file is processed for analysis—we don’t keep copies for marketing or training.",
    layout: "default",
  },
  {
    icon: "📊",
    tag: "Score",
    title: "Clear ATS breakdown",
    description:
      "Strengths, risks, and next steps in one view—no wall of generic advice.",
    layout: "default",
  },
  {
    icon: "🧭",
    tag: "Guide",
    title: "AI career guide",
    description:
      "Add your skills—we generate a structured path and milestones with Gemini.",
    layout: "default",
  },
  {
    icon: "✦",
    tag: "Pro",
    title: "Priority + Gemini polish",
    description:
      "Paid plans add application visibility, premium support, and deeper AI insights.",
    layout: "pro",
  },
];
