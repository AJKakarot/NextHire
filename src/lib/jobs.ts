import { Job } from "@/type";

export function isExternalJob(job: Pick<Job, "job_id" | "source" | "apply_url">) {
  return (
    job.source === "remotive" ||
    job.source === "jobicy" ||
    job.source === "himalayas" ||
    Boolean(job.apply_url) ||
    String(job.job_id).startsWith("ext-")
  );
}

export function isIndiaJob(job: Pick<Job, "title" | "location">) {
  const blob = `${job.location || ""} ${job.title || ""}`.toLowerCase();
  return [
    "india",
    "bengaluru",
    "bangalore",
    "hyderabad",
    "mumbai",
    "delhi",
    "pune",
    "chennai",
    "kolkata",
    "gurgaon",
    "gurugram",
    "noida",
    "remote, ind",
  ].some((token) => blob.includes(token));
}

export function sourceLabel(source?: Job["source"]) {
  if (source === "remotive") return "Remotive";
  if (source === "jobicy") return "Jobicy";
  if (source === "himalayas") return "Himalayas";
  return "NextHire";
}
