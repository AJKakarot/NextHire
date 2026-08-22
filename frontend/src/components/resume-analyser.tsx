"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  TrendingUp,
  Upload,
  Zap,
} from "lucide-react";
import axios from "axios";
import { ResumeAnalysisResponse } from "@/type";
import { utils_service } from "@/context/AppContext";
import toast from "react-hot-toast";
import { glassCardSm, sectionLabel } from "@/lib/brand";
import { ApiLoadingMessages } from "@/components/api-loading-messages";
import { useApiLoadingToast } from "@/hooks/use-api-loading-toast";

const pipelineSteps = [
  "extracting text from PDF…",
  "scoring ATS compatibility…",
  "generating suggestions…",
];

const IDLE_SEQUENCE = [
  { text: "$ nextHire analyze ./resume.pdf", kind: "command" as const },
  { text: "→ waiting for upload…", kind: "muted" as const },
  { text: "→ drop a file or click Upload resume", kind: "tip" as const },
];

const CHAR_MS = 26;
const LINE_PAUSE_MS = 480;
const IDLE_LOOP_GAP_MS = 2400;

function lineClass(kind: "command" | "muted" | "tip") {
  if (kind === "command") return "text-emerald-400/95";
  if (kind === "tip") return "text-orange-400/90";
  return "text-zinc-500";
}

const ResumeAnalyzer = ({ embedded = false }: { embedded?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [response, setResponse] = useState<ResumeAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const isIdle = !loading && !file;
  const apiToast = useApiLoadingToast({ toastId: "api-loading-resume" });

  useEffect(() => {
    if (!isIdle) return;
    const seq = IDLE_SEQUENCE;
    if (lineIdx >= seq.length) {
      const t = window.setTimeout(() => {
        setLineIdx(0);
        setCharIdx(0);
      }, IDLE_LOOP_GAP_MS);
      return () => window.clearTimeout(t);
    }
    const line = seq[lineIdx].text;
    if (charIdx < line.length) {
      const t = window.setTimeout(() => setCharIdx((c) => c + 1), CHAR_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLineIdx((n) => n + 1);
      setCharIdx(0);
    }, LINE_PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [isIdle, lineIdx, charIdx]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Please upload a PDF file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setResponse(null);
    }
  };

  const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const analyzeResume = async () => {
    if (!file) {
      toast.error("Please upload a resume");
      return;
    }

    setLoading(true);
    setPipelineIndex(0);
    apiToast.start();
    const interval = setInterval(() => {
      setPipelineIndex((i) => (i < pipelineSteps.length - 1 ? i + 1 : i));
    }, 900);

    try {
      const base64 = await convertToBase64(file);
      const { data } = await axios.post(
        `${utils_service}/api/utils/resume-analyser`,
        { pdfBase64: base64 }
      );
      setResponse(data);
      apiToast.success("Resume analyzed successfully!");
    } catch (error: any) {
      apiToast.error(
        error.response?.data?.message || "Failed to analyze resume"
      );
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setResponse(null);
    setOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-amber-400";
    return "text-rose-400";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high")
      return "border-rose-500/30 bg-rose-500/10 text-rose-300";
    if (priority === "medium")
      return "border-amber-500/30 bg-amber-500/10 text-amber-300";
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-300";
  };

  const ResultsView = () =>
    response ? (
      <div className="space-y-6">
        <div className="flex flex-col items-center py-4">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-orange-500/40"
            style={{
              background: `conic-gradient(#f97316 ${response.atsScore * 3.6}deg, rgba(255,255,255,0.06) 0deg)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-[#0c0f18]">
              <span
                className={`font-display text-4xl font-bold ${getScoreColor(response.atsScore)}`}
                style={{ fontFamily: "var(--font-syne)" }}
              >
                {response.atsScore}
              </span>
              <span className="text-xs text-zinc-500">ATS / 100</span>
            </div>
          </div>
        </div>

        <p className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
          {response.summary}
        </p>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <TrendingUp size={18} className="text-orange-400" />
            Score Breakdown
          </h3>
          <div className="grid gap-3 md:grid-cols-2">
            {Object.entries(response.scoreBreakdown).map(([key, value]) => (
              <div key={key} className={`${glassCardSm} p-4`}>
                <div className="flex items-center justify-between">
                  <p className="capitalize text-zinc-300">{key}</p>
                  <span className={`font-bold ${getScoreColor(value.score)}`}>
                    {value.score}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{value.feedback}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <h3 className="mb-2 flex items-center gap-2 font-semibold text-emerald-300">
            <CheckCircle2 size={18} /> Strengths
          </h3>
          <ul className="space-y-1 text-sm text-zinc-400">
            {response.strengths.map((s, i) => (
              <li key={i}>✓ {s}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-white">
            <AlertTriangle size={18} className="text-orange-400" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {response.suggestions.map((suggestion, index) => (
              <div key={index} className={`${glassCardSm} p-4`}>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-medium text-zinc-200">
                    {suggestion.category}
                  </h4>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${getPriorityColor(suggestion.priority)}`}
                  >
                    {suggestion.priority}
                  </span>
                </div>
                <p className="mt-2 text-xs text-zinc-500">{suggestion.issue}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  {suggestion.recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={resetDialog} variant="outline" className="w-full">
          Analyze Another Resume
        </Button>
      </div>
    ) : null;

  const terminalBody = (
    <div className="font-mono text-[10px] leading-snug sm:text-[11px] md:text-xs md:leading-snug">
      {loading ? (
        <>
          <p className="mb-1.5 text-emerald-400/95">
            $ nextHire analyze ./{file?.name ?? "resume.pdf"}
          </p>
          {pipelineSteps.slice(0, pipelineIndex + 1).map((step, i) => (
            <p key={i} className="mb-1.5 text-zinc-500">
              → {step}
            </p>
          ))}
          <p className="text-orange-400/95">
            → generating response
            <span className="terminal-cursor ml-0.5">▌</span>
          </p>
        </>
      ) : file ? (
        <>
          <p className="mb-1.5 text-emerald-400/95">
            $ nextHire analyze ./{file.name}
          </p>
          <p className="text-zinc-400">→ loaded: {file.name}</p>
        </>
      ) : (
        <>
          {IDLE_SEQUENCE.slice(0, lineIdx).map((step, i) => (
            <p key={`d-${i}`} className={`mb-1.5 ${lineClass(step.kind)}`}>
              {step.text}
            </p>
          ))}
          {lineIdx < IDLE_SEQUENCE.length && (
            <p className={`mb-0 ${lineClass(IDLE_SEQUENCE[lineIdx].kind)}`}>
              {IDLE_SEQUENCE[lineIdx].text.slice(0, charIdx)}
              <span
                className="ml-0.5 inline-block h-[1.1em] w-px translate-y-0.5 animate-pulse bg-orange-500/80 align-middle motion-reduce:animate-none"
                aria-hidden
              />
            </p>
          )}
        </>
      )}
    </div>
  );

  const terminalCard = (
    <div
      className={`mx-auto overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md ${
        embedded ? "max-w-3xl" : "max-w-3xl"
      }`}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/90" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/90" />
          </div>
          <span className="hidden font-mono text-[10px] text-zinc-500 sm:inline sm:text-[11px]">
            pipeline.log
          </span>
        </div>
        <span className="truncate font-mono text-[10px] text-zinc-500 sm:text-xs">
          nextHire — analyze
        </span>
      </div>

      <div className="h-[8.75rem] min-h-[8.75rem] max-h-[8.75rem] overflow-y-auto overscroll-contain px-3 py-2.5 sm:px-4 sm:py-3">
        {terminalBody}
      </div>

      <div className="border-t border-white/10 bg-black/20 p-3 sm:p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          onChange={handleFileSelect}
          className="hidden"
        />

        {response && !open ? (
          <ResultsView />
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={16} />
                {file ? file.name : "Choose PDF"}
              </Button>
              <Button
                className="flex-1 gap-2"
                onClick={analyzeResume}
                disabled={loading || !file}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    <Zap size={16} /> Analyze Resume
                  </>
                )}
              </Button>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <FileText size={16} /> Full Report
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-white/10 bg-[#0c0f18]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-white">
                      <FileText className="text-orange-400" />
                      Resume Analysis
                    </DialogTitle>
                  </DialogHeader>
                  {response ? (
                    <ResultsView />
                  ) : (
                    <p className="text-sm text-zinc-500">
                      Run an analysis first to see the full report.
                    </p>
                  )}
                </DialogContent>
              </Dialog>
            </div>
            <ApiLoadingMessages active={loading} className="mt-3 min-h-5" />
          </>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return terminalCard;
  }

  return (
    <section id="resume-analyzer" className="border-t border-white/10 py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className={sectionLabel}>Resume Analyzer</p>
          <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Check your ATS score before you apply
          </h2>
        </div>
        {terminalCard}
      </div>
    </section>
  );
};

export default ResumeAnalyzer;
