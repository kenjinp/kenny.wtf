import lume from "lume/mod.ts";
import esbuild from "lume/plugins/esbuild.ts";
import jsx from "lume/plugins/jsx.ts";
import metas from "lume/plugins/metas.ts";
import pagefind from "lume/plugins/pagefind.ts";
import prism from "lume/plugins/prism.ts";
import relative_urls from "lume/plugins/relative_urls.ts";
import sass from "lume/plugins/sass.ts";
import slugify_urls from "lume/plugins/slugify_urls.ts";
import source_maps from "lume/plugins/source_maps.ts";
import terser from "lume/plugins/terser.ts";

const site = lume({
  src: "./src",
  location: new URL("https://kenny.wtf"),
});

site.use(jsx());
site.use(esbuild());
site.use(metas());
site.use(pagefind());
site.use(prism());
site.use(sass());
site.use(source_maps());
site.use(slugify_urls());
site.use(terser());
site.use(relative_urls());

export default site;
