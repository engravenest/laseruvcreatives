import { headers } from "next/headers";

// Prefer a configured public origin; otherwise use the current deployment host.
export async function catalogMetadataBase(): Promise<URL> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return new URL(process.env.NEXT_PUBLIC_SITE_URL);
  const request = await headers();
  const host = (request.get("x-forwarded-host") || request.get("host") || "localhost:3000").split(",")[0].trim();
  const protocol = request.get("x-forwarded-proto")?.split(",")[0] === "https" ? "https" : "http";
  return new URL(`${protocol}://${host}`);
}
