import Link from "next/link";
import { logoClass } from "@/lib/brand";
import { cn } from "@/lib/utils";

const SiteLogo = ({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) => (
  <Link href={href} className={cn(logoClass, "inline-block", className)}>
    <span className="text-ink">Next</span>
    <span className="font-semibold text-brand">Hire</span>
  </Link>
);

export default SiteLogo;
