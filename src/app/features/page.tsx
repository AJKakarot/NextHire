import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import PageBackground from "@/components/page-background";
import RecruiterAway from "@/components/recruiter-away";

export default function FeaturesPage() {
  return (
    <RecruiterAway>
      <div className="relative bg-black">
        <PageBackground />
        <FeaturesSection />
        <HowItWorksSection />
      </div>
    </RecruiterAway>
  );
}
