import { articles } from "@/lib/data";

// Hide the requested cards without removing safety information from help flows.
export const libraryArticles = articles.filter(
  (article) => !["sexual-and-digital-violence", "grooming"].includes(article.slug),
);