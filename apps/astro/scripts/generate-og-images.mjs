import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { slug as slugger } from "github-slugger";
import { satoriAstroOG } from "satori-astro";
import { html } from "satori-html";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, "..");
const CONTENT_ROOT = path.join(APP_ROOT, "src", "content");
const PUBLIC_OG_ROOT = path.join(APP_ROOT, "public", "og");

function extractSiteConfigFromSource(source) {
  // Extremely lightweight parser for `src/config.ts` (avoid TS runtime).
  const getStr = (key) => {
    const m = source.match(new RegExp(`${key}:\\s*\"([^\"]+)\"`));
    return m?.[1];
  };
  return {
    website: getStr("website") ?? "https://example.com/",
    author: getStr("author") ?? "Author",
    title: getStr("title") ?? "Site",
    desc: getStr("desc") ?? "",
  };
}

function parseFrontmatter(markdown) {
  // Minimal `--- ... ---` YAML-like frontmatter parser (enough for draft/title/author/postSlug/ogImage).
  // If you need full YAML support later, swap to a library.
  if (!markdown.startsWith("---")) return { data: {}, content: markdown };
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return { data: {}, content: markdown };

  const raw = markdown.slice(3, end).trim();
  const content = markdown.slice(end + "\n---".length);
  const data = {};

  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    // strip quotes
    value = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    // boolean
    if (value === "true") value = true;
    else if (value === "false") value = false;
    data[key] = value;
  }

  return { data, content };
}

async function listContentFiles(dir) {
  const out = [];
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

async function loadFont() {
  // Prefer local font (no network). This file exists in `public/`.
  const fontPath = path.join(APP_ROOT, "public", "Diamonaire.ttf");
  return await readFile(fontPath);
}

function postTemplate({ title, author, website }) {
  return html`<div
    style="background:#fefbfb;width:100%;height:100%;display:flex;align-items:center;justify-content:center;"
  >
    <div
      style="position:absolute;top:-1px;right:-1px;border:4px solid #000;background:#ecebeb;opacity:.9;border-radius:4px;display:flex;justify-content:center;margin:2.5rem;width:88%;height:80%;"
    ></div>
    <div
      style="border:4px solid #000;background:pink;border-radius:4px;display:flex;justify-content:center;margin:2rem;width:88%;height:80%;"
    >
      <div
        style="display:flex;flex-direction:column;justify-content:space-between;margin:20px;width:90%;height:90%;"
      >
        <p
          style="font-size:72px;font-weight:700;max-height:84%;overflow:hidden;line-height:1.05;"
        >
          ${title}
        </p>
        <div
          style="display:flex;justify-content:space-between;width:100%;margin-bottom:8px;font-size:28px;"
        >
          <span
            >by
            <span style="font-weight:700;overflow:hidden;"
              >${author}</span
            ></span
          >
          <span style="font-weight:700;overflow:hidden;">${website}</span>
        </div>
      </div>
    </div>
  </div>`;
}

function siteTemplate({ title, desc, website }) {
  const hostname = (() => {
    try {
      return new URL(website).hostname;
    } catch {
      return website;
    }
  })();

  return html`<div
    style="background:#fefbfb;width:100%;height:100%;display:flex;align-items:center;justify-content:center;"
  >
    <div
      style="position:absolute;top:-1px;right:-1px;border:4px solid #000;background:#ecebeb;opacity:.9;border-radius:4px;display:flex;justify-content:center;margin:2.5rem;width:88%;height:80%;"
    ></div>
    <div
      style="border:4px solid #000;background:#fefbfb;border-radius:4px;display:flex;justify-content:center;margin:2rem;width:88%;height:80%;"
    >
      <div
        style="display:flex;flex-direction:column;justify-content:space-between;margin:20px;width:90%;height:90%;"
      >
        <div
          style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:90%;max-height:90%;overflow:hidden;text-align:center;"
        >
          <p style="font-size:72px;font-weight:700;line-height:1.05;">
            ${title}
          </p>
          <p style="font-size:28px;line-height:1.2;">${desc}</p>
        </div>
        <div
          style="display:flex;justify-content:flex-end;width:100%;margin-bottom:8px;font-size:28px;"
        >
          <span style="overflow:hidden;font-weight:700;">${hostname}</span>
        </div>
      </div>
    </div>
  </div>`;
}

async function generatePng({ template, outPath, fontData }) {
  const png = await satoriAstroOG({
    template,
    width: 1200,
    height: 630,
  }).toImage({
    satori: {
      fonts: [
        {
          name: "Diamonaire",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    },
  });

  await mkdir(path.dirname(outPath), { recursive: true });
  await writeFile(outPath, png);
}

async function main() {
  const configSource = await readFile(
    path.join(APP_ROOT, "src", "config.ts"),
    "utf8"
  );
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
    { name: "blog", urlPrefix: "posts", outDir: "posts" },
    { name: "projects", urlPrefix: "projects", outDir: "projects" },
  ];

  for (const col of collections) {
    const dir = path.join(CONTENT_ROOT, col.name);
    const files = await listContentFiles(dir);

    for (const fp of files) {
      const raw = await readFile(fp, "utf8");
      const { data } = parseFrontmatter(raw);

      const draft = data.draft === true || data.draft === "true";
      const hasOgImage =
        typeof data.ogImage === "string" && data.ogImage.length > 0;
      if (draft || hasOgImage) continue;

      const title = data.title;
      if (!title) continue;
      const author = data.author ?? site.author;
      const slug = slugger(
        data.postSlug ? String(data.postSlug) : String(title)
      );

      await generatePng({
        template: postTemplate({
          title: String(title),
          author: String(author),
          website: site.website,
        }),
        outPath: path.join(PUBLIC_OG_ROOT, col.outDir, `${slug}.png`),
        fontData,
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Generated OG images in ${PUBLIC_OG_ROOT}`);
}

await main();
