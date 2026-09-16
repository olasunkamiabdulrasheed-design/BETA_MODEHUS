import { useEffect } from "react";

export default function useDocumentTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — BETA_MODEHUS` : "BETA_MODEHUS";
    return () => {
      document.title = prev;
    };
  }, [title]);
}