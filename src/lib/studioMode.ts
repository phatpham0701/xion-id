/**
 * Studio mode — Standard vs Advanced.
 * Persisted in localStorage so it survives reloads.
 */

import { useEffect, useState } from "react";

export type StudioMode = "standard" | "advanced";

const KEY = "xionid:studio:mode";

export const getStudioMode = (): StudioMode => {
  if (typeof window === "undefined") return "standard";
  const v = window.localStorage.getItem(KEY);
  return v === "advanced" ? "advanced" : "standard";
};

export const setStudioMode = (m: StudioMode) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, m);
  window.dispatchEvent(new CustomEvent("xionid:studio:mode-change", { detail: m }));
};

export const useStudioMode = (): [StudioMode, (m: StudioMode) => void] => {
  const [mode, setMode] = useState<StudioMode>(() => getStudioMode());
  useEffect(() => {
    const onChange = (e: Event) => {
      const next = (e as CustomEvent<StudioMode>).detail;
      if (next === "standard" || next === "advanced") setMode(next);
    };
    window.addEventListener("xionid:studio:mode-change", onChange);
    return () => window.removeEventListener("xionid:studio:mode-change", onChange);
  }, []);
  return [mode, (m) => setStudioMode(m)];
};
