export function getApiBaseUrl(): string {
  // Prefer explicit env when provided (e.g., Render separate origins)
  const fromEnv = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  const cleaned = (fromEnv || "").trim().replace(/\/$/, "");
  if (cleaned) return cleaned;

  // Default: same-origin backend (works with Vite proxy in dev and unified origin in prod)
  return "";
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}



