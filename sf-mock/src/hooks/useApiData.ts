import { useEffect, useState } from "react";
import type { ExploriPanelData } from "../fixtures/types";

export type PanelKind = "portfolio-pulse" | "account" | "opportunity" | "lead-known";

export interface UseApiDataParams {
  exhibitor?: string;
  event?: string;
  company?: string;
}

export interface UseApiDataResult {
  data: ExploriPanelData | null;
  loading: boolean;
  error: string | null;
}

function buildUrl(panelKind: PanelKind, params: UseApiDataParams): string {
  switch (panelKind) {
    case "portfolio-pulse":
      return "/api/portfolio-pulse";
    case "account": {
      const qs = new URLSearchParams();
      if (params.exhibitor) qs.set("exhibitor", params.exhibitor);
      if (params.event) qs.set("event", params.event);
      return `/api/account?${qs.toString()}`;
    }
    case "opportunity": {
      const qs = new URLSearchParams();
      if (params.exhibitor) qs.set("exhibitor", params.exhibitor);
      if (params.event) qs.set("event", params.event);
      return `/api/opportunity?${qs.toString()}`;
    }
    case "lead-known": {
      const qs = new URLSearchParams();
      if (params.company) qs.set("company", params.company);
      return `/api/lead-known?${qs.toString()}`;
    }
  }
}

// Fetches real panel data from the /api/ routes for Canvas iframe mode. In the
// full wireframe (no ?mode=iframe), this is a no-op so fixtures/scenes.ts
// remains the only data source.
export function useApiData(
  panelKind: PanelKind | null,
  params: UseApiDataParams
): UseApiDataResult {
  const [data, setData] = useState<ExploriPanelData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isIframeMode = new URLSearchParams(window.location.search).get("mode") === "iframe";

  useEffect(() => {
    if (!isIframeMode || !panelKind) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(buildUrl(panelKind, params))
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        return res.json() as Promise<ExploriPanelData>;
      })
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIframeMode, panelKind, params.exhibitor, params.event, params.company]);

  return { data, loading, error };
}
