import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import React from "react";
import { slug as slugger } from "github-slugger";
import { satoriAstroOG } from "satori-astro";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, "..");
const CONTENT_ROOT = path.join(APP_ROOT, "src", "content");
const PUBLIC_OG_ROOT = path.join(APP_ROOT, "public", "og");

function extractSiteConfigFromSource(source: string) {
  // Extremely lightweight parser for `src/config.ts` (avoid TS runtime for app code).
  const getStr = (key: string) => {
    const m = source.match(new RegExp(`${key}:\\s*\\"([^\\"]+)\\"`));
    return m?.[1];
  };
  return {
    website: getStr("website") ?? "https://example.com/",
    author: getStr("author") ?? "Author",
    title: getStr("title") ?? "Site",
    desc: getStr("desc") ?? "",
  };
}

type Frontmatter = Record<string, unknown>;

function parseFrontmatter(markdown: string): {
  data: Frontmatter;
  content: string;
} {
  // Minimal `--- ... ---` YAML-like frontmatter parser (enough for draft/title/author/postSlug/ogImage).
  if (!markdown.startsWith("---")) return { data: {}, content: markdown };
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: markdown };

  const raw = markdown.slice(3, end).trim();
  const content = markdown.slice(end + "\n---".length);
  const data: Frontmatter = {};

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value: unknown = trimmed.slice(idx + 1).trim();

    if (typeof value === "string") {
      // strip quotes
      value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
      // boolean
      if (value === "true") value = true;
      else if (value === "false") value = false;
    }

    data[key] = value;
  }

  return { data, content };
}

async function listContentFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      out.push(...(await listContentFiles(p)));
    } else if (ent.isFile() && (p.endsWith(".md") || p.endsWith(".mdx"))) {
      out.push(p);
    }
  }
  return out;
}

async function loadFont(): Promise<Buffer> {
  // Prefer local font (no network). This file exists in `public/`.
  const fontPath = path.join(APP_ROOT, "public", "Diamonaire.ttf");
  return await readFile(fontPath);
}

function postTemplate(params: {
  title: string;
  author: string;
  website: string;
}) {
  const { title, author, website } = params;
  return React.createElement(
    "div",
    {
      style: {
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        top: "-1px",
        right: "-1px",
        border: "4px solid #000",
        background: "#ecebeb",
        opacity: "0.9",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "center",
        margin: "2.5rem",
        width: "88%",
        height: "80%",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          border: "4px solid #000",
          background: "pink",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px",
            width: "90%",
            height: "90%",
          },
        },
        React.createElement(
          "p",
          {
            style: {
              fontSize: 72,
              fontWeight: 700,
              maxHeight: "84%",
              overflow: "hidden",
              lineHeight: 1.05,
            },
          },
          title
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginBottom: "8px",
              fontSize: 28,
            },
          },
          React.createElement(
            "span",
            null,
            "by ",
            React.createElement(
              "span",
              { style: { fontWeight: 700, overflow: "hidden" } },
              author
            )
          ),
          React.createElement(
            "span",
            { style: { fontWeight: 700, overflow: "hidden" } },
            website
          )
        )
      )
    )
  );
}

function siteTemplate(params: {
  title: string;
  desc: string;
  website: string;
}) {
  const { title, desc, website } = params;
  const hostname = (() => {
    try {
      return new URL(website).hostname;
    } catch {
      return website;
    }
  })();

  return React.createElement(
    "div",
    {
      style: {
        background: "#fefbfb",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    React.createElement("div", {
      style: {
        position: "absolute",
        top: "-1px",
        right: "-1px",
        border: "4px solid #000",
        background: "#ecebeb",
        opacity: "0.9",
        borderRadius: "4px",
        display: "flex",
        justifyContent: "center",
        margin: "2.5rem",
        width: "88%",
        height: "80%",
      },
    }),
    React.createElement(
      "div",
      {
        style: {
          border: "4px solid #000",
          background: "#fefbfb",
          borderRadius: "4px",
          display: "flex",
          justifyContent: "center",
          margin: "2rem",
          width: "88%",
          height: "80%",
        },
      },
      React.createElement(
        "div",
        {
          style: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            margin: "20px",
            width: "90%",
            height: "90%",
          },
        },
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "90%",
              maxHeight: "90%",
              overflow: "hidden",
              textAlign: "center",
            },
          },
          React.createElement(
            "p",
            { style: { fontSize: 72, fontWeight: 700, lineHeight: 1.05 } },
            title
          ),
          React.createElement(
            "p",
            { style: { fontSize: 28, lineHeight: 1.2 } },
            desc
          )
        ),
        React.createElement(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              marginBottom: "8px",
              fontSize: 28,
            },
          },
          React.createElement(
            "span",
            { style: { overflow: "hidden", fontWeight: 700 } },
            hostname
          )
        )
      )
    )
  );
}

async function generatePng(params: {
  template: React.ReactNode;
  outPath: string;
  fontData: Buffer;
}) {
  const png = await satoriAstroOG({
    template: params.template,
    width: 1200,
    height: 630,
  }).toImage({
    satori: {
      fonts: [
        {
          name: "Diamonaire",
          data: params.fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  });

  await mkdir(path.dirname(params.outPath), { recursive: true });
  await writeFile(params.outPath, png as unknown as Uint8Array);
}

async function main() {
  const configSource = (await readFile(
    path.join(APP_ROOT, "src", "config.ts"),
    {
      encoding: "utf8",
    } as any
  )) as unknown as string;
  const site = extractSiteConfigFromSource(configSource);
  const fontData = await loadFont();

  // Site OG
  await generatePng({
    template: siteTemplate({
      title: site.title,
      desc: site.desc,
      website: site.website,
    }),
    outPath: path.join(PUBLIC_OG_ROOT, "site.png"),
    fontData,
  });

  const collections = [
    { name: "blog", outDir: "posts" },
    { name: "projects", outDir: "projects" },
  ] as const;

  for (const col of collections) {
    const dir = path.join(CONTENT_ROOT, col.name);
    const files = await listContentFiles(dir);

    for (const fp of files) {
      const raw = (await readFile(fp, {
        encoding: "utf8",
      } as any)) as unknown as string;
      const { data } = parseFrontmatter(raw);

      const draft = data.draft === true || data.draft === "true";
      const hasOgImage =
        typeof data.ogImage === "string" && data.ogImage.length > 0;
      if (draft || hasOgImage) continue;

      const title = data.title;
      if (typeof title !== "string" || title.length === 0) continue;
      const author =
        typeof data.author === "string" && data.author.length > 0
          ? data.author
          : site.author;
      const slug = slugger(
        typeof data.postSlug === "string" && data.postSlug.length > 0
          ? data.postSlug
          : title
      );

      await generatePng({
        template: postTemplate({ title, author, website: site.website }),
        outPath: path.join(PUBLIC_OG_ROOT, col.outDir, `${slug}.png`),
        fontData,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Generated OG images in ${PUBLIC_OG_ROOT}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
