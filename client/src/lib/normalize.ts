/**
 * Normalizes a URL by stripping protocol, www, and trailing slashes.
 * Forces lowercase for consistency.
 */
export function normalizeUrl(url: string): string {
  if (!url) return "";
  
  let normalized = url.toLowerCase().trim();
  
  // Remove protocol (http:// or https://)
  normalized = normalized.replace(/^(https?:\/\/)/, "");
  
  // Remove www.
  normalized = normalized.replace(/^www\./, "");
  
  // Remove trailing slashes
  normalized = normalized.replace(/\/+$/, "");
  
  return normalized;
}
