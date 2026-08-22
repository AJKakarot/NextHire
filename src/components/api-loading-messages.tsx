"use client";

import { API_LOADING_INTERVAL_MS, API_LOADING_MESSAGES } from "@/lib/api-loading-messages";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type ApiLoadingMessagesProps = {
  active: boolean;
  messages?: readonly string[];
  intervalMs?: number;
  className?: string;
};

export function ApiLoadingMessages({
  active,
  messages = API_LOADING_MESSAGES,
  intervalMs = API_LOADING_INTERVAL_MS,
  className = "",
}: ApiLoadingMessagesProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % messages.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [active, intervalMs, messages]);

  if (!active) return null;

  return (
    <div
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
      className={`overflow-hidden text-center text-sm text-zinc-400 ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={messages[index]}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
        >
          {messages[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
