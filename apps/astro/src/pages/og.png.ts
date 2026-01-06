import type { APIRoute } from "astro";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const GET: APIRoute = async () =>
  new Response(
    await readFile(
      fileURLToPath(new URL("../../public/og/site.png", import.meta.url))
    ),
    {
      headers: { "Content-Type": "image/png" },
    }
  );
