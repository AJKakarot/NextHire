"use client";

type GroqPolishToggleProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
};

export function GroqPolishToggle({
  checked,
  onChange,
  hint = "Sharper titles, examples, and a 30-day plan.",
}: GroqPolishToggleProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-center gap-2.5 text-sm text-mute">
        <input
          type="checkbox"
          checked={Boolean(checked)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-line bg-canvas accent-brand"
        />
        <span>
          Add{" "}
          <span className="font-medium text-info">Gemini/Groq</span> polish.
        </span>
      </label>
      {hint && <p className="mt-2 text-xs text-mute">{hint}</p>}
    </div>
  );
}
