"use client";
import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import React, { useEffect } from "react";
import Info from "./components/info";
import Skills from "./components/skills";
import Company from "./components/company";
import { useRouter } from "next/navigation";
import AppliedJobs from "./components/appliedJobs";
import PageBackground from "@/components/page-background";

const AccountPage = () => {
  const { isAuth, user, loading, applications, fetchApplications } = useAppData();

  const router = useRouter();

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  useEffect(() => {
    if (isAuth) fetchApplications();
  }, [isAuth]);

  if (loading) return <Loading />;
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      {user && (
        <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
          <Info user={user} isYourAccount={true} />
          {user.role === "jobseeker" && (
            <Skills user={user} isYourAccount={true} />
          )}
          {user.role === "jobseeker" && (
            <AppliedJobs applications={applications} />
          )}
          {user.role === "recruiter" && <Company />}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
