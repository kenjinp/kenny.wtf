import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"projects">["data"];
}

export default function ProjectCard({ href, frontmatter }: Props) {
  const { title, description, stars, heroImage, heroImageAlt } = frontmatter;

  const headerProps = {
    className: "text-lg font-semibold leading-snug",
  };

  return (
    <li className="my-6">
      <a
        {...(href ? { href } : {})}
        className="group block w-full overflow-hidden rounded-lg border border-skin-line/50 bg-skin-fill shadow-sm transition hover:border-skin-accent/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-skin-accent/60"
      >
        {heroImage && (
          <img
            className="h-64 w-full object-cover object-center"
            src={heroImage as string}
            alt={heroImageAlt ?? `Preview image for ${title}`}
          />
        )}

        <div className="border-t border-skin-line/50 px-4 py-3">
          <h3
            {...headerProps}
            className={`${headerProps.className} text-skin-accent group-hover:underline decoration-dashed underline-offset-4`}
          >
            {title}
            {typeof stars === "number" && (
              <span className="ml-2 text-sm font-normal text-skin-base/70">
                ({stars} stars)
              </span>
            )}
          </h3>
          <p className="mt-1 text-skin-base/80">{description}</p>
        </div>
      </a>
    </li>
  );
}
