"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAppData } from "@/context/AppContext";
import { Application, Job } from "@/type";
import axios from "axios";
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  ExternalLink,
  IndianRupee,
  MapPin,
  Users,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Link from "next/link";
import PageBackground from "@/components/page-background";
import { flushCard, glassCardSm } from "@/lib/brand";
import { isExternalJob, sourceLabel } from "@/lib/jobs";
import { resumeViewHref } from "@/lib/resume-url";

const JobPage = () => {
  const { id } = useParams();
  const { user, isAuth, applyJob, applications, btnLoading } = useAppData();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);

  const [applied, setApplied] = useState(false);
  const [myStatus, setMyStatus] = useState<Application["status"] | null>(null);

  useEffect(() => {
    if (applications && id) {
      const mine = applications.find(
        (item) => item.job_id.toString() === id.toString()
      );
      if (mine) {
        setApplied(true);
        setMyStatus(mine.status);
      }
    }
  }, [applications, id]);

  const applyJobHandler = (id: number) => {
    applyJob(id);
  };

  const [loading, setLoading] = useState(true);

  async function fetchSingleJob() {
    try {
      const { data } = await axios.get(`/api/job/${id}`);
      setJob(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleJob();
  }, [id]);

  const [jobApplications, setJobApplications] = useState<Application[]>([]);

  const token = Cookies.get("token");

  async function fetchJobApplications() {
    try {
      const { data } = await axios.get(
        `/api/job/application/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setJobApplications(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (user && job && !external && user.user_id === job.posted_by_recuriter_id) {
      fetchJobApplications();
    }
  }, [user, job]);

  const [filterStatus, setFilterStatus] = useState("All");

  const filteredApplications =
    filterStatus === "All"
      ? jobApplications
      : jobApplications.filter((app) => app.status === filterStatus);

  const [statusDrafts, setStatusDrafts] = useState<Record<number, string>>({});
  const external = Boolean(job && isExternalJob(job));

  const updateApplicationHandler = async (applicationId: number) => {
    const nextStatus = statusDrafts[applicationId];
    if (!nextStatus) return toast.error("Please give valid value");

    try {
      const { data } = await axios.put(
        `/api/job/application/update/${applicationId}`,
        { status: nextStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(data.message);
      fetchJobApplications();
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      {loading ? (
        <Loading />
      ) : (
        <>
          {job && (
            <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              <Button
                variant={"ghost"}
                className="mb-6 gap-2"
                onClick={() => router.back()}
              >
                <ArrowRight size={18} /> Back to jobs
              </Button>

              <Card className={`${flushCard} mb-6 border-white/[0.08] bg-white/[0.04] shadow-lg shadow-black/20`}>
                <div className="border-b border-white/10 bg-gradient-to-r from-orange-500/90 to-orange-600/90 px-6 py-5 sm:px-8">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1">
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                            job.is_active
                              ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                              : "border border-rose-500/30 bg-rose-500/15 text-rose-300"
                          }`}
                        >
                          {job.is_active ? "Open" : "Closed"}
                        </span>
                        {external && (
                          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white">
                            Via {sourceLabel(job.source)}
                          </span>
                        )}
                      </div>

                      <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
                        {job.title}
                      </h1>
                      {job.company_name ? (
                        <div className="flex items-center gap-2 text-base text-white/80">
                          <Building2 size={18} />
                          <span>{job.company_name}</span>
                        </div>
                      ) : null}
                    </div>

                    {external ? (
                      job.apply_url && (
                        <a
                          href={job.apply_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0"
                        >
                          <Button className="h-12 gap-2 px-8">
                            <ExternalLink size={18} />
                            Apply on {sourceLabel(job.source)}
                          </Button>
                        </a>
                      )
                    ) : (
                      user &&
                      user.role === "jobseeker" && (
                        <div className="shrink-0">
                          {applied ? (
                            <div
                              className={`flex items-center gap-2 rounded-xl border px-6 py-3 font-medium ${
                                myStatus === "Hired"
                                  ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                                  : myStatus === "Rejected"
                                    ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
                                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                              }`}
                            >
                              {myStatus === "Rejected" ? (
                                <XCircle size={20} />
                              ) : (
                                <CheckCircle2 size={20} />
                              )}
                              {myStatus === "Hired"
                                ? "You were hired"
                                : myStatus === "Rejected"
                                  ? "Not selected"
                                  : "Already Applied"}
                            </div>
                          ) : (
                            job.is_active && (
                              <Button
                                onClick={() =>
                                  applyJobHandler(Number(job.job_id))
                                }
                                disabled={btnLoading}
                                className="h-12 gap-2 px-8"
                              >
                                <Briefcase size={18} />{" "}
                                {btnLoading ? "Applying..." : "Easy Apply"}
                              </Button>
                            )
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* details */}
                <div className="p-8">
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className={`${glassCardSm} flex items-center gap-3 p-4`}>
                      <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <MapPin size={20} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs opacity-70 font-medium mb-1">
                          Location
                        </p>
                        <p className="font-semibold">{job.location}</p>
                      </div>
                    </div>

                    <div className={`${glassCardSm} flex items-center gap-3 p-4`}>
                      <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <IndianRupee size={20} className="text-orange-400" />
                      </div>
                      <div>
                        <p className="text-xs opacity-70 font-medium mb-1">
                          Salary
                        </p>
                        <p className="font-semibold">
                          {external
                            ? job.salary_text || "Not disclosed"
                            : `₹${Number(job.salary || 0).toLocaleString("en-IN")} P.A`}
                        </p>
                      </div>
                    </div>

                    <div className={`${glassCardSm} flex items-center gap-3 p-4`}>
                      <div className="h-12 w-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        {external ? (
                          <Briefcase size={20} className="text-orange-400" />
                        ) : (
                          <Users size={20} className="text-orange-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs opacity-70 font-medium mb-1">
                          {external ? "Type" : "Openings"}
                        </p>
                        <p className="font-semibold">
                          {external
                            ? job.job_type
                            : `${Math.round(Number(job.openings || 0))} ${
                                Math.round(Number(job.openings || 0)) === 1
                                  ? "position"
                                  : "positions"
                              }`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {applied && myStatus && myStatus !== "Submitted" && (
                    <div
                      className={`${glassCardSm} mb-8 p-4 ${
                        myStatus === "Hired"
                          ? "border-emerald-500/30"
                          : "border-rose-500/30"
                      }`}
                    >
                      <p
                        className={`text-sm font-medium ${
                          myStatus === "Hired"
                            ? "text-emerald-300"
                            : "text-rose-300"
                        }`}
                      >
                        {myStatus === "Hired"
                          ? "The recruiter hired you for this role. Check your email for the update."
                          : "The recruiter did not select you for this role."}
                      </p>
                    </div>
                  )}

                  {/* job descripiton */}
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Briefcase size={24} className="text-orange-400" />
                      Job Description
                    </h2>

                    <div className={`${glassCardSm} p-6`}>
                      <p className="whitespace-pre-line text-base leading-relaxed text-zinc-300">
                        {job.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {user && job && !external && user.user_id === job.posted_by_recuriter_id && (
        <div className="relative mx-auto mb-8 mt-8 w-[90%] max-w-3xl md:w-2/3">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-white">All Applications</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="filter-status" className="text-sm font-medium">
                Filter:
              </label>
              <select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-11 rounded-xl border border-white/15 bg-black/30 px-3 text-zinc-100 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="All">All Status</option>
                <option value="Submitted">Submitted</option>
                <option value="Hired">Hired</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {jobApplications && jobApplications.length > 0 ? (
            <>
              <div className="space-y-4">
                {filteredApplications.map((e) => (
                  <div
                    className={`${glassCardSm} p-4`}
                    key={e.application_id}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-white">
                          {e.applicant_name ||
                            e.applicant_email?.split("@")[0] ||
                            "Applicant"}
                        </p>
                        {e.applicant_email && (
                          <p className="truncate text-sm text-zinc-400">
                            {e.applicant_email}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-sm font-medium ${
                          e.status === "Hired"
                            ? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                            : e.status === "Rejected"
                            ? "border border-rose-500/30 bg-rose-500/10 text-rose-300"
                            : "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                        }`}
                      >
                        {e.status}
                      </span>
                    </div>

                    <div className="flex gap-3 mb-3">
                      <Link
                        target="_blank"
                        href={resumeViewHref(e.resume)}
                        className="text-orange-400 hover:text-orange-300 text-sm"
                      >
                        View Resume
                      </Link>

                      <Link
                        target="_blank"
                        href={`/account/${e.applicant_id}`}
                        className="text-orange-400 hover:text-orange-300 text-sm"
                      >
                        View Profile
                      </Link>
                    </div>

                    {/* update Status */}
                    <div className="flex gap-2 pt-3 border-t">
                      <select
                        value={statusDrafts[e.application_id] || ""}
                        onChange={(event) =>
                          setStatusDrafts((prev) => ({
                            ...prev,
                            [e.application_id]: event.target.value,
                          }))
                        }
                        className="flex-1 p-2 border-2 border-gray-300 rounded-md bg-background"
                      >
                        <option value="">Update status</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Hired">Hired</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                      <Button
                        disabled={btnLoading}
                        onClick={() =>
                          updateApplicationHandler(e.application_id)
                        }
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredApplications.length === 0 && (
                <p className="text-center py-8 opacity-70">
                  No application with status {filterStatus}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-center py-8 opacity-70">No application Yet.</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default JobPage;
