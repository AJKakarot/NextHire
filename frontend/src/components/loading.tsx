import React from "react";

const Loading = () => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-24">
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2.5 w-2.5 animate-pulse rounded-full bg-orange-500"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="font-mono text-sm text-zinc-500">analyzing…</p>
    </div>
  );
};

export default Loading;
