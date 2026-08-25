import { Job } from "@/type";
import { redisClient } from "./redis";

const CACHE_KEY = "external-jobs:v2";
const CACHE_TTL_SECONDS = 6 * 60 * 60;
const CACHE_TTL_MS = CACHE_TTL_SECONDS * 1000;

type MemoryCache = { at: number; jobs: Job[] };
let memory: MemoryCache | null = null;

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function mapJobType(value?: string | null): Job["job_type"] {
  const raw = (value || "").toLowerCase().replace(/[_-]/g, " ");
  if (raw.includes("part")) return "Part-time";
  if (raw.includes("intern")) return "Internship";
  if (raw.includes("contract") || raw.includes("freelance")) return "Contract";
  return "Full-time";
}

async function fetchJson(url: string, timeoutMs = 6000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "NextHire/1.0 (https://nexthires.app)",
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

function fromRemotive(raw: Record<string, unknown>): Job {
  const id = String(raw.id ?? "");
  const salary = typeof raw.salary === "string" ? raw.salary.trim() : "";
  return {
    job_id: `ext-r-${id}`,
    title: String(raw.title || "Untitled role"),
    description: stripHtml(String(raw.description || "")),
    salary: null,
    salary_text: salary || null,
    location: String(raw.candidate_required_location || "Remote"),
    job_type: mapJobType(String(raw.job_type || "")),
    openings: 1,
    role: String(raw.category || "Software"),
    work_location: "Remote",
    company_id: 0,
    company_name: String(raw.company_name || "Company"),
    company_logo: String(raw.company_logo || "/user.png"),
    posted_by_recuriter_id: 0,
    created_at: String(raw.publication_date || new Date().toISOString()),
    is_active: true,
    source: "remotive",
    apply_url: String(raw.url || ""),
  };
}

function fromJobicy(raw: Record<string, unknown>): Job {
  const id = String(raw.id ?? "");
  const types = Array.isArray(raw.jobType) ? raw.jobType : [];
  const salaryBits = [
    raw.annualSalaryMin ? String(raw.annualSalaryMin) : "",
    raw.annualSalaryMax ? String(raw.annualSalaryMax) : "",
  ].filter(Boolean);
  const currency = raw.salaryCurrency ? String(raw.salaryCurrency) : "";
  const salary_text = salaryBits.length
    ? `${currency} ${salaryBits.join(" – ")}`.trim()
    : null;

  return {
    job_id: `ext-j-${id}`,
    title: String(raw.jobTitle || "Untitled role"),
    description: stripHtml(
      String(raw.jobDescription || raw.jobExcerpt || "")
    ),
    salary: null,
    salary_text,
    location: String(raw.jobGeo || "Remote"),
    job_type: mapJobType(String(types[0] || "")),
    openings: 1,
    role: Array.isArray(raw.jobIndustry)
      ? String(raw.jobIndustry[0] || "Software")
      : "Software",
    work_location: "Remote",
    company_id: 0,
    company_name: String(raw.companyName || "Company"),
    company_logo: String(raw.companyLogo || "/user.png"),
    posted_by_recuriter_id: 0,
    created_at: String(raw.pubDate || new Date().toISOString()),
    is_active: true,
    source: "jobicy",
    apply_url: String(raw.url || ""),
  };
}

function himalayasId(guid: string) {
  const slug = guid.split("/jobs/").pop() || guid;
  return `ext-h-${slug.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 80)}`;
}

function fromHimalayas(raw: Record<string, unknown>): Job | null {
  const countries = Array.isArray(raw.locationRestrictions)
    ? raw.locationRestrictions.map((item) => String(item))
    : [];
  const location = countries.join(", ") || "India";
  if (!location.toLowerCase().includes("india")) return null;

  const apply_url = String(raw.applicationLink || raw.guid || "");
  if (!apply_url) return null;

  const salaryBits = [
    raw.minSalary ? String(raw.minSalary) : "",
    raw.maxSalary ? String(raw.maxSalary) : "",
  ].filter(Boolean);
  const currency = raw.currency ? String(raw.currency) : "";
  const salary_text = salaryBits.length
    ? `${currency} ${salaryBits.join(" – ")}`.trim()
    : null;

  const published =
    typeof raw.pubDate === "number" && raw.pubDate > 1_000_000_000
      ? new Date(raw.pubDate * 1000).toISOString()
      : new Date().toISOString();

  return {
    job_id: himalayasId(String(raw.guid || apply_url)),
    title: String(raw.title || "Untitled role"),
    description: stripHtml(String(raw.description || raw.excerpt || "")),
    salary: null,
    salary_text,
    location,
    job_type: mapJobType(String(raw.employmentType || "")),
    openings: 1,
    role: Array.isArray(raw.categories)
      ? String(raw.categories[0] || "Software")
      : "Software",
    work_location: "Remote",
    company_id: 0,
    company_name: String(raw.companyName || "Company"),
    company_logo: String(raw.companyLogo || "/user.png"),
    posted_by_recuriter_id: 0,
    created_at: published,
    is_active: true,
    source: "himalayas",
    apply_url,
  };
}

async function loadHimalayasIndia() {
  const queries = ["india", "developer india", "engineer india", "bangalore"];
  const pages = await Promise.allSettled(
    queries.map((q) =>
      fetchJson(
        `https://himalayas.app/jobs/api/search?q=${encodeURIComponent(q)}`
      )
    )
  );

  return pages.flatMap((result) => {
    if (result.status !== "fulfilled") return [];
    const jobs = Array.isArray(result.value.jobs) ? result.value.jobs : [];
    return jobs
      .map((job) => fromHimalayas(job as Record<string, unknown>))
      .filter((job): job is Job => Boolean(job));
  });
}

async function loadRemotive() {
  const data = await fetchJson(
    "https://remotive.com/api/remote-jobs?category=software-dev"
  );
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  return jobs
    .map((job) => fromRemotive(job as Record<string, unknown>))
    .filter((job) => job.apply_url);
}

async function loadJobicy() {
  const data = await fetchJson(
    "https://jobicy.com/api/v2/remote-jobs?count=20&tag=software"
  );
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  return jobs
    .map((job) => fromJobicy(job as Record<string, unknown>))
    .filter((job) => job.apply_url);
}

async function readCache() {
  if (memory && Date.now() - memory.at < CACHE_TTL_MS) {
    return memory.jobs;
  }
  try {
    const cached = await redisClient.get<Job[]>(CACHE_KEY);
    if (Array.isArray(cached) && cached.length > 0) {
      memory = { at: Date.now(), jobs: cached };
      return cached;
    }
  } catch (error) {
    console.error("external jobs cache read failed", error);
  }
  return null;
}

async function writeCache(jobs: Job[]) {
  memory = { at: Date.now(), jobs };
  try {
    await redisClient.set(CACHE_KEY, jobs, { ex: CACHE_TTL_SECONDS });
  } catch (error) {
    console.error("external jobs cache write failed", error);
  }
}

async function fetchFreshJobs() {
  const settled = await Promise.allSettled([
    loadHimalayasIndia(),
    loadRemotive(),
    loadJobicy(),
  ]);
  const jobs = settled.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );
  const seen = new Set<string>();
  return jobs.filter((job) => {
    const key = `${job.company_name}:${job.title}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function getExternalJobs() {
  const cached = await readCache();
  if (cached) return cached;

  const jobs = await fetchFreshJobs();
  if (jobs.length > 0) await writeCache(jobs);
  return jobs;
}

export async function getExternalJob(jobId: string) {
  const jobs = await getExternalJobs();
  return jobs.find((job) => String(job.job_id) === jobId) || null;
}

export function filterExternalJobs(
  jobs: Job[],
  title: string,
  location: string
) {
  const titleQ = title.trim().toLowerCase();
  const locationQ = location.trim().toLowerCase();

  return jobs.filter((job) => {
    if (titleQ) {
      const haystack = `${job.title} ${job.company_name} ${job.role}`.toLowerCase();
      if (!haystack.includes(titleQ)) return false;
    }

    if (!locationQ) return true;
    if (locationQ === "remote") return true;

    const jobLocation = (job.location || "").toLowerCase();
    return (
      jobLocation.includes(locationQ) ||
      jobLocation.includes("worldwide") ||
      jobLocation.includes("anywhere") ||
      jobLocation.includes("india")
    );
  });
}
