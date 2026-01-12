import { GITHUB_TOKEN } from "@config";
import { getCollection, type CollectionEntry } from "astro:content";

let projectsCollectionPromise: Promise<CollectionEntry<"projects">[]> | null =
  null;

export const getProjectsCollection = async () => {
  if (projectsCollectionPromise) return projectsCollectionPromise;

  projectsCollectionPromise = (async () => {
    const projects = await getCollection("projects");

    const promises = projects.map(async (project) => {
      const repoSlug = project.data.githubLink
        .trim()
        .replace(/^https?:\/\/github\.com\//, "")
        .replace(/\/$/, "");

      const headers: Record<string, string> = {
        "X-GitHub-Api-Version": "2022-11-28",
      };

      if (GITHUB_TOKEN) headers.Authorization = `Bearer ${GITHUB_TOKEN}`;

      try {
        const response = await fetch(
          `https://api.github.com/repos/${repoSlug}`,
          {
            headers,
          }
        );

        if (!response.ok) return project;

        const data = await response.json();
        const pushedAt =
          typeof data?.pushed_at === "string" ? data.pushed_at : "";
        const lastCommitDate = pushedAt ? new Date(pushedAt) : undefined;

        return {
          ...project,
          data: {
            ...project.data,
            stars: data.stargazers_count,
            forks: data.forks_count,
            issues: data.open_issues_count,
            language: data.language,
            lastCommitDate:
              lastCommitDate && !Number.isNaN(lastCommitDate.getTime())
                ? lastCommitDate
                : undefined,
          },
        };
      } catch {
        return project;
      }
    });

    const enriched = await Promise.all(promises);

    enriched.sort((a, b) => {
      const aT = a.data.lastCommitDate
        ? new Date(a.data.lastCommitDate).getTime()
        : -Infinity;
      const bT = b.data.lastCommitDate
        ? new Date(b.data.lastCommitDate).getTime()
        : -Infinity;

      if (bT !== aT) return bT - aT;

      // Stable tie-breaker so ordering is deterministic.
      return a.data.title.localeCompare(b.data.title);
    });

    return enriched;
  })();

  return projectsCollectionPromise;
};
