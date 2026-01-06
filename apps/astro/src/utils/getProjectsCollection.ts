import { GITHUB_TOKEN } from "@config";
import { getCollection } from "astro:content";

export const getProjectsCollection = async () => {
  let projects = await getCollection("projects");
  const promises = projects.reverse().map(async (project) => {
    const response = await fetch(
      `https://api.github.com/repos/${project.data.githubLink.replace(
        "https://github.com/",
        ""
      )}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    const data = await response.json();
    return {
      ...project,
      data: {
        ...project.data,
        stars: data.stargazers_count,
        forks: data.forks_count,
        issues: data.open_issues_count,
        language: data.language,
      },
    };
  });

  return await Promise.all(promises);
};
