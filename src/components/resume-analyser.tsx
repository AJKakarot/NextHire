"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { ResumeAnalysisResponse } from "@/type";
import toast from "react-hot-toast";
import { glassCardSm, sectionLabel } from "@/lib/brand";
import { useApiLoadingToast } from "@/hooks/use-api-loading-toast";

export type ResumeAnalyzerHandle = {
  openFilePicker: () => void;
};

const pipelineSteps = [
  "extracting text from PDF…",
  "scoring ATS compatibility…",
  "generating suggestions…",
];

const IDLE_SEQUENCE = [
  { text: "$ resume-ai analyze ./resume.pdf", kind: "command" as const },
  { text: "→ waiting for upload…", kind: "muted" as const },
  { text: "→ drop a file or click Upload resume", kind: "tip" as const },
];

const CHAR_MS = 26;
const LINE_PAUSE_MS = 480;
const IDLE_LOOP_GAP_MS = 2400;

function lineClass(kind: "command" | "muted" | "tip") {
  if (kind === "command") return "text-info";
  if (kind === "tip") return "text-mute";
  return "text-mute";
}

function isPdf(file: File) {
  return (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  );
}

const ResumeAnalyzer = forwardRef<
  ResumeAnalyzerHandle,
  {
    embedded?: boolean;
    polish?: boolean;
    targetJob?: string;
    jobDescription?: string;
  }
>(function ResumeAnalyzer(
  { embedded = false, polish = true, targetJob = "", jobDescription = "" },
  ref
) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pipelineIndex, setPipelineIndex] = useState(0);
  const [response, setResponse] = useState<ResumeAnalysisResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiToast = useApiLoadingToast({ toastId: "api-loading-resume" });

  const [lineIdx, setLineIdx] = useState(1);
  const [charIdx, setCharIdx] = useState(0);
  const isIdle = !loading && !file;

  useImperativeHandle(ref, () => ({
    openFilePicker: () => fileInputRef.current?.click(),
  }));

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

  const convertToBase64 = (pdf: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(pdf);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const analyzeResume = async (selected: File) => {
    setLoading(true);
    setPipelineIndex(0);
    apiToast.start();
    const interval = setInterval(() => {
      setPipelineIndex((i) => (i < pipelineSteps.length - 1 ? i + 1 : i));
    }, 900);

    try {
      const base64 = await convertToBase64(selected);
      const { data } = await axios.post(`/api/utils/resume-analyser`, {
        pdfBase64: base64,
        polish,
        targetJob,
        jobDescription,
      });
      setResponse(data);
      apiToast.success("Resume analyzed successfully!");
    } catch (error: any) {
      apiToast.error(
        error.response?.data?.message || "Failed to analyze resume"
      );
      setFile(null);
    } finally {
      clearInterval(interval);
      setLoading(false);
    }
  };

  const acceptFile = (selectedFile: File) => {
    if (!isPdf(selectedFile)) {
      toast.error("Please upload a PDF file");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    setFile(selectedFile);
    setResponse(null);
    void analyzeResume(selectedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) acceptFile(selectedFile);
    e.target.value = "";
  };

  const resetAnalyzer = () => {
    setFile(null);
    setResponse(null);
    setPipelineIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-ok";
    if (score >= 60) return "text-warn";
    return "text-danger";
  };

  const getPriorityColor = (priority: string) => {
    if (priority === "high")
      return "border-danger/30 bg-danger/10 text-danger";
    if (priority === "medium")
      return "border-warn/30 bg-warn/10 text-warn";
    return "border-ok/30 bg-ok/10 text-ok";
  };

  const visibleLines = (() => {
    if (loading) return 2 + Math.min(pipelineIndex + 1, pipelineSteps.length);
    if (file) return 2;
    return Math.max(lineIdx + (charIdx > 0 || lineIdx === 0 ? 1 : 0), 1);
  })();

  const terminalBody = loading ? (
    <>
      <p className="mb-1.5 text-left whitespace-pre-wrap break-all text-info">
        $ resume-ai analyze ./{file?.name ?? "resume.pdf"}
      </p>
      {pipelineSteps.slice(0, pipelineIndex + 1).map((step, i) => (
        <p key={i} className="mb-1.5 text-left text-mute">
          → {step}
        </p>
      ))}
      <p className="text-left text-brand">
        → generating response
        <span className="terminal-cursor ml-0.5">▌</span>
      </p>
    </>
  ) : file && !response ? (
    <>
      <p className="mb-1.5 text-left whitespace-pre-wrap break-all text-info">
        $ resume-ai analyze ./{file.name}
      </p>
      <p className="text-left text-mute">→ loaded: {file.name}</p>
    </>
  ) : (
    <>
      {IDLE_SEQUENCE.slice(0, lineIdx).map((step, i) => (
        <p
          key={`d-${i}`}
          className={`mb-1.5 text-left whitespace-pre-wrap break-all ${lineClass(step.kind)}`}
        >
          {step.text}
        </p>
      ))}
      {lineIdx < IDLE_SEQUENCE.length && (
        <p className={`mb-0 text-left whitespace-pre-wrap break-all ${lineClass(IDLE_SEQUENCE[lineIdx].kind)}`}>
          {IDLE_SEQUENCE[lineIdx].text.slice(0, charIdx)}
          <span
            className="ml-0.5 inline-block h-[1.1em] w-px translate-y-0.5 animate-pulse bg-brand/80 align-middle motion-reduce:animate-none"
            aria-hidden
          />
        </p>
      )}
    </>
  );

  const ResultsView = () =>
    response ? (
      <div className="space-y-6">
        <div className="flex flex-col items-center py-4">
          <div
            className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-brand/40"
            style={{
              background: `conic-gradient(#F97316 ${(response.atsScore ?? 0) * 3.6}deg, #27272A 0deg)`,
            }}
          >
            <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-canvas">
              <span
                className={`text-4xl font-bold ${getScoreColor(response.atsScore ?? 0)}`}
              >
                {response.atsScore ?? 0}
              </span>
              <span className="text-xs text-zinc-500">ATS / 100</span>
            </div>
          </div>
        </div>

        {response.summary && (
          <p className="rounded-xl border border-line bg-canvas p-4 text-sm text-mute">
            {response.summary}
          </p>
        )}

        {response.scoreBreakdown && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
              <TrendingUp size={18} className="text-brand" />
              Score Breakdown
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {Object.entries(response.scoreBreakdown).map(([key, value]) => (
                <div key={key} className={`${glassCardSm} p-4`}>
                  <div className="flex items-center justify-between">
                    <p className="capitalize text-ink">{key}</p>
                    <span className={`font-bold ${getScoreColor(value?.score ?? 0)}`}>
                      {value?.score ?? 0}%
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-mute">{value?.feedback}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {(response.strengths?.length ?? 0) > 0 && (
          <div className="rounded-xl border border-ok/20 bg-ok/5 p-4">
            <h3 className="mb-2 flex items-center gap-2 font-semibold text-ok">
              <CheckCircle2 size={18} /> Strengths
            </h3>
            <ul className="space-y-1 text-sm text-mute">
              {response.strengths.map((s, i) => (
                <li key={i}>✓ {s}</li>
              ))}
            </ul>
          </div>
        )}

        {(response.suggestions?.length ?? 0) > 0 && (
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold text-ink">
              <AlertTriangle size={18} className="text-warn" />
              Recommendations
            </h3>
            <div className="space-y-3">
              {response.suggestions.map((suggestion, index) => (
                <div key={index} className={`${glassCardSm} p-4`}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-medium text-ink">
                      {suggestion.category}
                    </h4>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${getPriorityColor(suggestion.priority)}`}
                    >
                      {suggestion.priority}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-mute">{suggestion.issue}</p>
                  <p className="mt-1 text-xs text-mute">
                    {suggestion.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={resetAnalyzer} variant="outline" className="w-full">
          Analyze Another Resume
        </Button>
      </div>
    ) : null;

  const terminalCard = (
    <div className="mx-auto w-full max-w-2xl scroll-mt-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => !loading && fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (!loading && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          if (!loading) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) acceptFile(dropped);
        }}
        className={`overflow-hidden rounded-xl border bg-elevated shadow-[0_8px_32px_-12px_rgba(0,0,0,0.5)] backdrop-blur-md outline-none ${
          dragging ? "border-brand/50" : "border-line"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line bg-canvas px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex shrink-0 gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]/90" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]/90" />
            </div>
            <span className="hidden font-mono text-[10px] text-mute sm:inline sm:text-[11px]">
              pipeline.log
            </span>
          </div>
          <span className="truncate font-mono text-[10px] text-mute sm:text-xs">
            resume-ai — analyze
          </span>
        </div>

        <div className="flex h-[8.75rem] min-h-[8.75rem] max-h-[8.75rem] font-mono text-[10px] leading-snug sm:h-[9.25rem] sm:min-h-[9.25rem] sm:max-h-[9.25rem] sm:text-[11px] md:text-xs md:leading-snug">
          <div className="flex min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="shrink-0 select-none border-r border-line bg-canvas px-2 py-2 text-right font-mono text-mute sm:px-3 sm:py-2.5">
              {Array.from({ length: Math.max(visibleLines, 3) }, (_, i) => (
                <div key={i} className="tabular-nums leading-snug">
                  {i + 1}
                </div>
              ))}
            </div>
            <div className="min-h-0 min-w-0 flex-1 px-2 py-2 sm:px-3 sm:py-2.5">
              {terminalBody}
            </div>
          </div>
        </div>
      </div>

      {response && (
        <div className="mt-6 rounded-xl border border-line bg-elevated p-5 sm:p-6">
          <ResultsView />
        </div>
      )}
    </div>
  );

  if (embedded) {
    return terminalCard;
  }

  return (
    <section id="resume-analyzer" className="border-t border-line py-16 md:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <p className={sectionLabel}>Resume Analyzer</p>
          <h2 className="mt-2 text-3xl font-semibold text-ink md:text-4xl">
            Check your ATS score before you apply
          </h2>
        </div>
        {terminalCard}
      </div>
    </section>
  );
});

export default ResumeAnalyzer;
