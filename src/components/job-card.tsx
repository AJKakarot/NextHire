"use client";
import { useAppData } from "@/context/AppContext";
import { Job } from "@/type";
import React from "react";
import { Card, CardContent, CardHeader } from "./ui/card";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle,
  IndianRupee,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const { user, btnLoading, applyJob, applications } = useAppData();
  const myApplication = applications?.find((item) => item.job_id === job.job_id);
  const appliedStatus = myApplication?.status;
  const applied = Boolean(myApplication);

  return (
    <Card className="group w-full max-w-none border-white/[0.08] bg-white/[0.04] transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 line-clamp-2 text-xl font-semibold text-white transition-colors group-hover:text-orange-200">
              {job.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <Building2 size={16} />
              <span>{job.company_name}</span>
            </div>
          </div>
          <Link href={`/company/${job.company_id}`} className="shrink-0">
            <div className="h-14 w-14 overflow-hidden rounded-xl border border-white/10 bg-black/30 transition-transform hover:scale-105">
              <img
                src={job.company_logo}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-3 py-1.5 text-sm text-orange-300">
            <MapPin size={14} />
            <span className="font-medium">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-base font-semibold text-ok">
            <IndianRupee size={18} />
            <span>
              {Number(job.salary || 0).toLocaleString("en-IN")} P.A
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 border-t border-white/10 pt-4">
        <div className="flex w-full gap-2">
          <Link href={`/jobs/${job.job_id}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2 group/btn">
              View Details
              <ArrowRight
                size={16}
                className="transition-transform group-hover/btn:translate-x-1"
              />
            </Button>
          </Link>

          {user && user.role === "jobseeker" && (
            <>
              {applied ? (
                <div
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${
                    appliedStatus === "Hired"
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : appliedStatus === "Rejected"
                        ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
                        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  <CheckCircle size={15} />
                  {appliedStatus === "Hired"
                    ? "Hired"
                    : appliedStatus === "Rejected"
                      ? "Rejected"
                      : "Applied"}
                </div>
              ) : (
                job.is_active !== false && (
                  <Button
                    disabled={btnLoading}
                    onClick={() => applyJob(job.job_id)}
                    className="flex-1 gap-2"
                  >
                    <Briefcase size={16} />
                    Easy Apply
                  </Button>
                )
              )}
            </>
          )}
        </div>

        {job.is_active === false && (
          <div className="w-full rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-center text-sm font-medium text-rose-300">
            Position Closed
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
