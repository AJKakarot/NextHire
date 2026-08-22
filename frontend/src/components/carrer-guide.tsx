"use client";

import { CareerGuideResponse } from "@/type";
import { utils_service } from "@/context/AppContext";
import axios from "axios";
import {
  BookOpen,
  Briefcase,
  Lightbulb,
  Loader2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import SiteLogo from "./site-logo";
import toast from "react-hot-toast";
import { glassCardSm } from "@/lib/brand";
import { ApiLoadingMessages } from "@/components/api-loading-messages";
import { useApiLoadingToast } from "@/hooks/use-api-loading-toast";

const parseSkills = (raw: string) =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const CarrerGuide = () => {
  const [skillsInput, setSkillsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CareerGuideResponse | null>(null);

  const skills = useMemo(() => parseSkills(skillsInput), [skillsInput]);
  const canGenerate = skills.length > 0 && !loading;
  const apiToast = useApiLoadingToast({
    toastId: "api-loading-career",
    mode: "replace",
  });

  const getCarrerGuidance = async () => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    setLoading(true);
    apiToast.start();
    try {
      const { data } = await axios.post(`${utils_service}/api/utils/career`, {
        skills,
      });
      setResponse(data);
      apiToast.success("Career guidance generated");
    } catch (error: any) {
      apiToast.error(
        error.response?.data?.message || "Failed to generate guide"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && canGenerate) {
      e.preventDefault();
      getCarrerGuidance();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-black">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <SiteLogo />
        <Link
          href="/"
          className="text-sm font-medium text-orange-500 transition-colors hover:text-orange-400"
        >
          ← Home
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-white sm:text-[1.65rem]">
            Generate your path
          </h1>

          <div className="mt-8 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Skills
            </p>
            <Input
              value={skillsInput}
              onChange={(e) => {
                setSkillsInput(e.target.value);
                setResponse(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="e.g. React, TypeScript, Node.js, PostgreSQL"
              className="h-12 rounded-xl border-white/10 bg-black/50 text-zinc-100 placeholder:text-zinc-600"
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-center gap-2.5 text-sm text-zinc-400">
            <input
              type="checkbox"
              disabled
              className="h-4 w-4 rounded border-white/20 bg-black/40 accent-orange-500"
            />
            <span>
              Add{" "}
              <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text font-medium text-transparent">
                Gemini
              </span>{" "}
              polish.
            </span>
          </label>

          <p className="mt-2 text-xs text-zinc-600">
            Upgrade to enable —{" "}
            <Link href="/subscribe" className="text-orange-500 hover:text-orange-400">
              view plans
            </Link>
          </p>

          <Button
            onClick={getCarrerGuidance}
            disabled={!canGenerate}
            className="mt-6 h-12 w-full rounded-xl border border-white/10 bg-white/[0.06] text-sm font-medium text-zinc-300 shadow-none transition-all hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-40 enabled:border-orange-500/30 enabled:bg-orange-500 enabled:text-black enabled:hover:bg-orange-400"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Generating…
              </span>
            ) : (
              "Generate guide"
            )}
          </Button>

          <ApiLoadingMessages active={loading} className="mt-4 min-h-5" />
        </div>

        {response && (
          <div className="mt-10 w-full max-w-2xl space-y-6">
            <div className={`${glassCardSm} p-5`}>
              <div className="flex items-start gap-3">
                <Lightbulb className="mt-1 shrink-0 text-orange-400" size={20} />
                <div>
                  <h2 className="font-semibold text-white">Career Summary</h2>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                    {response.summary}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <Briefcase size={18} className="text-orange-400" />
                Recommended Paths
              </h3>
              <div className="space-y-3">
                {response.jobOptions.map((job, index) => (
                  <div key={index} className={`${glassCardSm} p-4`}>
                    <h4 className="font-semibold text-orange-200">{job.title}</h4>
                    <p className="mt-2 text-sm text-zinc-400">
                      {job.responsibilities}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      <span className="text-zinc-400">Why: </span>
                      {job.why}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <TrendingUp size={18} className="text-orange-400" />
                Skills to Learn
              </h3>
              <div className="space-y-4">
                {response.skillsToLearn.map((category, index) => (
                  <div key={index}>
                    <h4 className="mb-2 text-sm font-medium text-orange-300">
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.skills.map((skill, sindex) => (
                        <div key={sindex} className={`${glassCardSm} p-3 text-sm`}>
                          <p className="font-medium text-zinc-200">{skill.title}</p>
                          <p className="mt-1 text-xs text-zinc-500">{skill.why}</p>
                          <p className="mt-1 text-xs text-zinc-500">{skill.how}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${glassCardSm} p-5`}>
              <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
                <BookOpen size={18} className="text-orange-400" />
                {response.learningApproach.title}
              </h3>
              <ul className="space-y-2">
                {response.learningApproach.points.map((point, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-zinc-400"
                  >
                    <span className="text-orange-400">•</span>
                    <span dangerouslySetInnerHTML={{ __html: point }} />
                  </li>
                ))}
              </ul>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setResponse(null);
                setSkillsInput("");
              }}
            >
              Start New Analysis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarrerGuide;
