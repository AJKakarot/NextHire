"use client";

import SiteLogo from "@/components/site-logo";
import PageBackground from "@/components/page-background";
import { glassCard } from "@/lib/brand";
import { cn } from "@/lib/utils";
import React from "react";

const AuthShell = ({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) => (
  <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
    <PageBackground />
    <div className="relative w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="mb-6 flex justify-center">
          <SiteLogo />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">{subtitle}</p>
      </div>
      <div className={cn(glassCard, "p-8")}>{children}</div>
    </div>
  </div>
);

export default AuthShell;
