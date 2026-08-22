"use client";

import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "./loading";

/** Jobseeker-only pages: send Hire Talent accounts to Browse Jobs. */
export default function RecruiterAway({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuth, loading } = useAppData();
  const router = useRouter();
  const isRecruiter = isAuth && user?.role === "recruiter";

  useEffect(() => {
    if (isRecruiter) router.replace("/jobs");
  }, [isRecruiter, router]);

  if (loading || isRecruiter) return <Loading />;
  return <>{children}</>;
}
