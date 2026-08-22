"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import PageBackground from "@/components/page-background";
import {
  cloudinaryPdfPageUrl,
  isCloudinaryPdf,
  resumeOriginalHref,
} from "@/lib/resume-url";
import Link from "next/link";

function ResumeViewer() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url") || "";
  const [maxPage, setMaxPage] = useState(8);
  const pages = Array.from({ length: maxPage }, (_, i) => i + 1);

  if (!url) {
    return (
      <p className="relative z-10 py-20 text-center text-zinc-400">
        No resume URL provided.
      </p>
    );
  }

  if (!isCloudinaryPdf(url)) {
    return (
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-10">
        <iframe
          title="Resume"
          src={url}
          className="h-[80vh] w-full rounded-xl border border-white/10 bg-black"
        />
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-white">Resume</h1>
        <Link
          href={resumeOriginalHref(url)}
          target="_blank"
          className="text-sm text-orange-400 hover:text-orange-300"
        >
          Open original
        </Link>
      </div>
      <div className="space-y-4">
        {pages.map((page) => (
          <img
            key={page}
            src={cloudinaryPdfPageUrl(url, page)}
            alt={`Resume page ${page}`}
            className="w-full rounded-xl border border-white/10 bg-white"
            onError={() => {
              if (page === 1) return;
              setMaxPage((current) => Math.min(current, page - 1));
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ResumeViewPage() {
  return (
    <div className="relative min-h-screen bg-black">
      <PageBackground />
      <Suspense
        fallback={
          <p className="relative z-10 py-20 text-center text-zinc-400">
            Loading resume…
          </p>
        }
      >
        <ResumeViewer />
      </Suspense>
    </div>
  );
}
