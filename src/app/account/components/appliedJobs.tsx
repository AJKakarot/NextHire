"use client";
import { Card } from "@/components/ui/card";
import { glassCardAccount } from "@/lib/brand";
import { Application } from "@/type";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  IndianRupee,
  Eye,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import React from "react";

interface AppliedJobsProps {
  applications: Application[];
}

const AppliedJobs: React.FC<AppliedJobsProps> = ({ applications }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "hired":
        return {
          icon: CheckCircle2,
          color: "text-emerald-300",
          bg: "bg-emerald-500/10",
          border: "border-emerald-500/30",
          message: "The recruiter hired you for this role.",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-rose-300",
          bg: "bg-rose-500/10",
          border: "border-rose-500/30",
          message: "You were not selected for this role.",
        };
      default:
        return {
          icon: Clock,
          color: "text-amber-300",
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          message: "Your application is with the recruiter.",
        };
    }
  };
  return (
    <div className="mb-6">
      <Card className={glassCardAccount}>
        <div className="border-b bg-orange-500/90 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Your Applied Jobs</h1>
              <p className="text-sm text-white/80">
                {applications.length} applications submitted
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {applications && applications.length > 0 ? (
            <div className="space-y-4">
              {applications.map((a) => {
                const statusConfig = getStatusConfig(a.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={a.application_id}
                    className="p-5 rounded-lg border-2 hover:border-orange-500/30 transition-all bg-background"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-3 text-xl font-semibold">
                          {a.job_title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300">
                            <IndianRupee size={14} />
                            <span className="font-medium">
                              {Number(a.job_salary || 0).toLocaleString("en-IN")} P.A
                            </span>
                          </div>

                          <div
                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 ${statusConfig.bg} ${statusConfig.border}`}
                          >
                            <StatusIcon
                              size={14}
                              className={statusConfig.color}
                            />
                            <span
                              className={`text-sm font-medium ${statusConfig.color}`}
                            >
                              {a.status}
                            </span>
                          </div>
                        </div>
                        <p className={`mt-3 text-sm ${statusConfig.color}`}>
                          {statusConfig.message}
                        </p>
                      </div>

                      <Link
                        href={`/jobs/${a.job_id}`}
                        className="shrink-0 flex items-center justify-center gap-1.5"
                      >
                        <Eye size={16} />
                        View Job
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <>
              <p>No Applications Yet</p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AppliedJobs;
