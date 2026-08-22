"use client";

import { CareerGuideResponse } from "@/type";
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
import { CAREER_LOADING_MESSAGES } from "@/lib/api-loading-messages";
import { useApiLoadingToast } from "@/hooks/use-api-loading-toast";
import { GroqPolishToggle } from "@/components/groq-polish-toggle";

const parseSkills = (raw: string) =>
  raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const CarrerGuide = () => {
  const [skillsInput, setSkillsInput] = useState("");
  const [polish, setPolish] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<CareerGuideResponse | null>(null);

  const skills = useMemo(() => parseSkills(skillsInput), [skillsInput]);
  const canGenerate = skills.length > 0 && !loading;
  const apiToast = useApiLoadingToast({
    toastId: "api-loading-career",
    mode: "replace",
    messages: CAREER_LOADING_MESSAGES,
  });

  const getCarrerGuidance = async () => {
    if (skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(`/api/utils/career`, {
        skills,
        polish,
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
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <SiteLogo />
        <Link
          href="/"
          className="text-sm font-medium text-info transition-colors hover:text-brand-hover"
        >
          ← Home
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
        <div className="w-full max-w-xl rounded-2xl border border-line bg-elevated p-6 sm:p-8">
          <h1 className="text-center text-2xl font-semibold tracking-tight text-ink sm:text-[1.65rem]">
            Generate your path
          </h1>

          <div className="mt-8 space-y-2">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-mute">
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
              className="h-12 rounded-xl border-line bg-canvas text-ink placeholder:text-mute"
            />
          </div>

          <div className="mt-5">
            <GroqPolishToggle checked={polish} onChange={setPolish} />
          </div>

          <Button
            onClick={getCarrerGuidance}
            disabled={!canGenerate}
            className="mt-6 h-12 w-full rounded-xl border border-line bg-elevated text-sm font-medium text-mute shadow-none transition-all hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-40 enabled:border-brand/30 enabled:bg-brand enabled:text-ink enabled:hover:bg-brand-hover"
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

          <ApiLoadingMessages
            active={loading}
            messages={CAREER_LOADING_MESSAGES}
            className="mt-4 min-h-5"
          />
        </div>

        {response && (
          <div className="mt-10 w-full max-w-2xl space-y-6">
            {response.summary && (
              <div className={`${glassCardSm} p-5`}>
                <div className="flex items-start gap-3">
                  <Lightbulb className="mt-1 shrink-0 text-brand" size={20} />
                  <div>
                    <h2 className="font-semibold text-ink">Career Summary</h2>
                    <p className="mt-2 text-sm leading-relaxed text-mute">
                      {response.summary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(response.jobOptions?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
                  <Briefcase size={18} className="text-brand" />
                  Recommended Paths
                </h3>
                <div className="space-y-3">
                  {response.jobOptions.map((job, index) => (
                    <div key={index} className={`${glassCardSm} p-4`}>
                      <h4 className="font-semibold text-brand-hover">
                        {job.title}
                      </h4>
                      {job.responsibilities && (
                        <p className="mt-2 text-sm text-mute">
                          {job.responsibilities}
                        </p>
                      )}
                      {job.why && (
                        <p className="mt-2 text-xs text-mute">
                          <span className="text-mute">Why: </span>
                          {job.why}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(response.skillsToLearn?.length ?? 0) > 0 && (
              <div>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
                  <TrendingUp size={18} className="text-brand" />
                  Skills to Learn
                </h3>
                <div className="space-y-4">
                  {response.skillsToLearn.map((category, index) => (
                    <div key={index}>
                      <h4 className="mb-2 text-sm font-medium text-brand-hover">
                        {category.category}
                      </h4>
                      <div className="space-y-2">
                        {(category.skills || []).map((skill, sindex) => (
                          <div
                            key={sindex}
                            className={`${glassCardSm} p-3 text-sm`}
                          >
                            <p className="font-medium text-ink">
                              {skill.title}
                            </p>
                            {skill.why && (
                              <p className="mt-1 text-xs text-mute">
                                {skill.why}
                              </p>
                            )}
                            {skill.how && (
                              <p className="mt-1 text-xs text-mute">
                                {skill.how}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(response.learningApproach?.points?.length ?? 0) > 0 && (
              <div className={`${glassCardSm} p-5`}>
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
                  <BookOpen size={18} className="text-brand" />
                  {response.learningApproach.title || "How to Approach Learning"}
                </h3>
                <ul className="space-y-2">
                  {response.learningApproach.points.map((point, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-mute"
                    >
                      <span className="text-brand">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
