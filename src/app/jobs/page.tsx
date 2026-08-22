"use client";
import { Job } from "@/type";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useAppData } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Search, X } from "lucide-react";
import Loading from "@/components/loading";
import JobCard from "@/components/job-card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PageBackground from "@/components/page-background";
import { glassCardSm } from "@/lib/brand";

const locations: string[] = [
  "Delhi",
  "Mumbai",
  "Banglore",
  "Hyderabad",
  "Pune",
  "Kolkata",
  "Chennai",
  "Remote",
];

const JobsPage = () => {
  const { user, isAuth } = useAppData();
  const isRecruiter = isAuth && user?.role === "recruiter";
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [draftTitle, setDraftTitle] = useState("");
  const [draftLocation, setDraftLocation] = useState("");

  const token = Cookies.get("token");

  async function fetchJobs(nextTitle = title, nextLocation = location) {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/job/all?title=${nextTitle}&location=${nextLocation}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setJobs(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchJobs();
  }, [title, location]);

  const applyFilters = () => {
    setTitle(draftTitle);
    setLocation(draftLocation);
  };

  const clearFilter = () => {
    setDraftTitle("");
    setDraftLocation("");
    setTitle("");
    setLocation("");
    fetchJobs("", "");
  };

  const hasActiveFilters = title || location;

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {isRecruiter ? (
              <>
                Browse{" "}
                <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">
                  Jobs
                </span>
              </>
            ) : (
              <>
                Explore{" "}
                <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">
                  Opportunities
                </span>
              </>
            )}
          </h1>
          <p className="mt-2 text-zinc-400">
            {isRecruiter
              ? `${jobs.length} open roles in the market`
              : `${jobs.length} jobs found`}
          </p>
        </div>

        <div className={`${glassCardSm} mb-8 grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto_auto]`}>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Job title
            </Label>
            <div className="relative">
              <Search className="icon-style" />
              <Input
                placeholder="SDE, Software Engineer…"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
              Location
            </Label>
            <div className="relative">
              <MapPin className="icon-style" />
              <select
                value={draftLocation}
                onChange={(e) => setDraftLocation(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/15 bg-black/30 pl-10 pr-3 text-zinc-100 outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20"
              >
                <option value="">All Locations</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-end">
            <Button onClick={applyFilters} className="w-full md:w-auto">
              Apply filters
            </Button>
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              onClick={clearFilter}
              className="w-full md:w-auto"
            >
              Clear
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-500">Active:</span>
            {title && (
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-sm text-orange-200">
                {title}
                <button onClick={() => setTitle("")}>
                  <X size={14} />
                </button>
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-sm text-orange-200">
                {location}
                <button onClick={() => setLocation("")}>
                  <X size={14} />
                </button>
              </span>
            )}
          </div>
        )}

        {loading ? (
          <Loading />
        ) : jobs.length > 0 ? (
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard job={job} key={job.job_id} />
            ))}
          </div>
        ) : (
          <div className={`${glassCardSm} py-16 text-center`}>
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04]">
              <Briefcase size={40} className="text-zinc-600" />
            </div>
            <h3 className="text-xl font-semibold text-white">No jobs found</h3>
            <p className="mt-2 text-sm text-zinc-500">
              Try clearing filters or search for a different role.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
