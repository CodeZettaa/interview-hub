import type { MetadataRoute } from "next";
import { TOPICS } from "@/lib/constants";
import { getQuestionsRepository } from "@/lib/repositories";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = getQuestionsRepository();
  const questions = await repo.getQuestions();
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/questions`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${SITE_URL}/challenge`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/generate`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/onboarding`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const techRoutes: MetadataRoute.Sitemap = TOPICS.map((topic) => ({
    url: `${SITE_URL}/questions/${topic.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = TOPICS.flatMap((topic) =>
    topic.categories.map((cat) => ({
      url: `${SITE_URL}/questions/${topic.id}/${cat.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  );

  const questionRoutes: MetadataRoute.Sitemap = questions.map((q) => ({
    url: `${SITE_URL}/questions/${q.technology}/${q.categorySlug}/${q.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...techRoutes, ...categoryRoutes, ...questionRoutes];
}
