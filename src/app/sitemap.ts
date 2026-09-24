import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.scopenegotiator.com",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://www.scopenegotiator.com/login",
      lastModified: new Date(),
      priority: 0.5,
    },
  ];
}
