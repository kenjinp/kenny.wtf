import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import { slugifyStr } from "@utils/slugify";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function getStaticPaths() {
  const posts = await getCollection("projects").then((p) =>
    p.filter(({ data }) => !data.draft && !data.ogImage),
  );

  return posts.map((post) => ({
    params: { slug: slugifyStr(post.data.title) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(
    await readFile(
      fileURLToPath(
        new URL(
          `../../../../public/og/projects/${slugifyStr((props as CollectionEntry<"projects">).data.title)}.png`,
          import.meta.url,
        ),
      ),
    ),
    {
      headers: { "Content-Type": "image/png" },
    },
  );
