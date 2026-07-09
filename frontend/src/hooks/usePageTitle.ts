import { useEffect } from "react";

const BASE_TITLE = "LMS Platform";

/** Sets the browser-tab title for the current page ("<title> — LMS Platform"). */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
