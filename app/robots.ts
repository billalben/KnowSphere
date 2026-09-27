import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = env.BETTER_AUTH_URL.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/dashboard",
        "/api",
        "/payment",
        "/login",
        "/verify-request",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
