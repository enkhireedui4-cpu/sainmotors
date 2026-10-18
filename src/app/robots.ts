import type { MetadataRoute } from "next";
import { IS_PRODUCTION_ORIGIN, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Production is indexable; any staging origin is closed to crawlers. */
export default function robots(): MetadataRoute.Robots {
  if (!IS_PRODUCTION_ORIGIN) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
