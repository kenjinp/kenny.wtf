import type { APIRoute } from "astro";
import { getCollection, type CollectionEntry } from "astro:content";
import slugify from "@utils/slugify";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function getStaticPaths() {
  const posts = (await getCollection("projects")).filter(
    (post: CollectionEntry<"projects">) =>
      !post.data.draft && !post.data.ogImage
  );

  return posts.map((post: CollectionEntry<"projects">) => ({
    params: { slug: slugify(post.data) },
    props: post,
  }));
}

export const GET: APIRoute = async ({ props }) =>
  new Response(
    await readFile(
      fileURLToPath(
        new URL(
          `../../../../public/og/projects/${slugify(
            (props as CollectionEntry<"projects">).data
          )}.png`,
          import.meta.url
        )
      )
    ),
    {
      headers: { "Content-Type": "image/png" },
    }
  );
