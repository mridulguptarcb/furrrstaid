export function getApiBaseUrl(): string {
  const env = (import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env;
  const cleaned = (env?.VITE_API_BASE_URL || "").trim().replace(/\/$/, "");
  if (cleaned) return cleaned;
  return "";
}

export function buildApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}



