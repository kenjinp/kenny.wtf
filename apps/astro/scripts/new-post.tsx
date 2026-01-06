import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { cancel, intro, isCancel, outro, text } from "@clack/prompts";
import { slug as slugger } from "github-slugger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(APP_ROOT, "src", "content", "blog");

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function todayStrLocal(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function parseTags(input: string): string[] {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function yamlStr(value: string): string {
  // JSON string is valid YAML scalar and safely escapes quotes/newlines/etc.
  return JSON.stringify(value);
}

async function main() {
  intro("New blog post");

  const title = await text({
    message: "Title",
    validate(value) {
      if (!value || value.trim().length === 0) return "Title is required";
    },
  });
  if (isCancel(title)) {
    cancel("Cancelled");
    process.exitCode = 1;
    return;
  }

  const defaultSlug = slugger(String(title));
  const postSlug = await text({
    message: "postSlug",
    initialValue: defaultSlug,
    validate(value) {
      if (!value || value.trim().length === 0) return "postSlug is required";
    },
  });
  if (isCancel(postSlug)) {
    cancel("Cancelled");
    process.exitCode = 1;
    return;
  }

  const description = await text({
    message: "Description",
    validate(value) {
      if (!value || value.trim().length === 0) return "Description is required";
    },
  });
  if (isCancel(description)) {
    cancel("Cancelled");
    process.exitCode = 1;
    return;
  }

  const tagsInput = await text({
    message: "Tags (comma-separated)",
    placeholder: "procgen, graphics, world-synth",
  });
  if (isCancel(tagsInput)) {
    cancel("Cancelled");
    process.exitCode = 1;
    return;
  }

  const tags = parseTags(String(tagsInput));
  const today = todayStrLocal();
  const slug = slugger(String(postSlug));
  const outFile = path.join(BLOG_DIR, `${today}-${slug}.mdx`);

  if (existsSync(outFile)) {
    throw new Error(`Post already exists: ${outFile}`);
  }

  const frontmatterLines: string[] = [
    "---",
    `pubDatetime: ${today}`,
    `title: ${yamlStr(String(title))}`,
    `postSlug: ${slug}`,
    "draft: true",
  ];

  // If tags are omitted, the collection schema default applies (["others"]).
  if (tags.length > 0) {
    frontmatterLines.push("tags:");
    for (const tag of tags) frontmatterLines.push(`  - ${tag}`);
  }

  frontmatterLines.push(`description: ${yamlStr(String(description))}`);
  frontmatterLines.push("---", "");

  const body = `# ${String(title).trim()}\n\n`;
  const mdx = `${frontmatterLines.join("\n")}${body}`;

  await mkdir(BLOG_DIR, { recursive: true });
  await writeFile(outFile, mdx, { encoding: "utf8" });

  outro(`Created ${outFile}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});
