export const API_LOADING_MESSAGES = [
  "Optimizing your resume for recruiters…",
  "Analyzing skills and experience…",
  "AI is thinking… don't worry, it's smart 😏",
] as const;

export const CAREER_LOADING_MESSAGES = [
  "Mapping your skills to roles…",
  "Building a career path…",
  "AI is thinking… don't worry, it's smart 😏",
] as const;

export const API_LOADING_INTERVAL_MS = 2600;

export type ApiLoadingMessage = (typeof API_LOADING_MESSAGES)[number];
