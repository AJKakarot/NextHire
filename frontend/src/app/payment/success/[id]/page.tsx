"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import PageBackground from "@/components/page-background";
import { glassCard } from "@/lib/brand";

const PaymentVerification = () => {
  const { id } = useParams();

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <PageBackground />
      <div className={`${glassCard} w-full max-w-md p-8 text-center`}>
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle size={40} className="text-emerald-400" />
        </div>
        <h1 className="text-3xl font-semibold text-white">You&apos;re on Pro!</h1>
        <p className="mt-2 text-zinc-400">
          Payment successful. Transaction ID: {id}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/account">
            <Button variant="outline">Go to Account</Button>
          </Link>
          <Link href="/jobs">
            <Button>Browse Jobs</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerification;
