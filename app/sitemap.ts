import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Nearly everything in this app sits behind the auth middleware — these are
// the only routes a logged-out visitor (or a crawler) can actually reach.
// The marketing pages are the ones written to be found: a careers lead
// searching for enterprise provision should land on /schools, not on /login.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/founders",
    "/become-an-ambassador",
    "/schools",
    "/safeguarding",
    "/about",
    "/signup",
    "/login",
  ];

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
