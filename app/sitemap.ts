import type { MetadataRoute } from "next";

const BASE = "https://logiclaw.co.kr";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/practice-areas", "/staff", "/location", "/contact"].map(
    (path) => ({
      url: `${BASE}${path}`,
      changeFrequency: "monthly",
      priority: path === "" ? 1 : 0.8,
    })
  );
}
