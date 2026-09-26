const KEY = "dts_tracking";

const PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "fbclid",
  "ttclid",
  "click_id",
  "gclid",
  "sck",
  "src",
] as const;

type Tracking = Record<string, string>;

function read(): Tracking {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Tracking) : {};
  } catch {
    return {};
  }
}

/** Captures click IDs / UTMs from the current URL and merges them into localStorage. */
export function captureTracking(): Tracking {
  if (typeof window === "undefined") return {};
  const search = new URLSearchParams(window.location.search);
  const stored = read();
  const next: Tracking = { ...stored };
  for (const p of PARAMS) {
    const v = search.get(p);
    if (v) next[p] = v;
  }
  if (search.get("fbclid") && !next["ttclid"] && !next["click_id"]) next["utm_source"] ??= "facebook";
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  return next;
}

/** Query-string of persisted tracking data, merged with anything in the current URL. */
export function getTrackingQuery(): string {
  if (typeof window === "undefined") return "";
  const data = captureTracking();
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(data)) if (v) qs.set(k, v);
  return qs.toString();
}
