import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"projects">["data"];
}

export default function ProjectCard({ href, frontmatter }: Props) {
  const { title, description, stars, heroImage } = frontmatter;

  const headerProps = {
    className: "text-lg font-medium decoration-dashed hover:underline",
  };

  return (
    <li className="my-6">
      <a
        href={href}
        className="inline-block w-full text-lg font-medium text-skin-accent decoration-dashed underline-offset-4 focus-visible:no-underline focus-visible:underline-offset-0"
      >
        {heroImage && (
          <img
            className="mb-4 h-64 w-full object-cover object-center"
            src={heroImage as string}
          />
        )}
        <h3 {...headerProps}>
          {title} ({stars} stars)
        </h3>
      </a>
      <p>{description}</p>
    </li>
  );
}
