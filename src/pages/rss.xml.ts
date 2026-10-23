import type { APIRoute } from "astro";
import rss from "@astrojs/rss";
import { type CollectionEntry, getCollection } from "astro:content";

import { defaultLocale } from "@/config/siteSettings.json";
import { getLocalizedRoute } from "@/js/translationUtils";
import { getTranslatedData } from "@/js/translationUtils";

const siteData = getTranslatedData("siteData", defaultLocale);

import { getAllPosts } from "@/js/blogUtils";

// you can switch the RSS locale here to something else if desired
const rssLocale = defaultLocale;

// this is needed for getAuthorName() below
const authors: CollectionEntry<"authors">[] = await getCollection("authors");

export const GET: APIRoute = async (context) => {
  const posts = await getAllPosts(rssLocale);
  const site = context.site!;

  return rss({
    // ex. you can use a stylesheet from "public/rss/styles.xsl"
    // stylesheet: "/rss/styles.xsl",
    // `<title>` field in output xml
    title: siteData.title,
    // `<description>` field in output xml
    description: siteData.description,
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#contextsite
    site,
    // media is needed for blog posts. recommended to add atom support
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
      atom: "http://www.w3.org/2005/Atom",
      dc: "http://purl.org/dc/elements/1.1/",
    },
    // add atom:link to be compatible with atom
    customData: `<atom:link href="${site}rss.xml" rel="self" type="application/rss+xml" />`,
    // items (each post)
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,

      // the author goes in dc:creator by name only, since RSS <author> requires an email
      // and a plain address in the feed gets harvested by spammers
      // this also adds the blog post image
      customData:
        `<dc:creator>${getAuthorName(post.data.authors[0].id)}</dc:creator>` +
        (post.data.heroImage
          ? `<media:content
          type="image/${post.data.heroImage.format == "jpg" ? "jpeg" : "png"}"
          width="${post.data.heroImage.width}"
          height="${post.data.heroImage.height}"
          medium="image"
          url="${getImageUrl(post)}" />
      `
          : ""),

      // Compute RSS link from post `slug`
      link: getLocalizedRoute(rssLocale, `/blog/${post.id}/`),
    })),
  });
};

// --------------------------------------------------------
// map the post author slug to the author name
const getAuthorName = (authorSlug: string) => {
  let authorName = "unk";
  authors.map((author) => {
    if (author.id === authorSlug) {
      authorName = author.data.name;
    }
  });

  return authorName;
};

// --------------------------------------------------------
// get image url from frontmatter
const getImageUrl = (post: CollectionEntry<"blog">) => {
  let imageUrl = "";
  let imageUrlEnd = "";

  // Check if heroImage exists
  if (!post.data.heroImage) {
    return "";
  }

  // assumes post.data.heroImage is defined
  imageUrlEnd = post.data.heroImage.src.toString();

  // in dev mode, url is /@fs/full/path/to/project/public/assets/images/image-name.jpg
  if (imageUrlEnd.startsWith("/@fs")) {
    imageUrl = imageUrlEnd;
  }
  // in deployment, imageUrlEnd is correct. Something like "_astro/img-name.hash.jpg"
  else {
    imageUrl = import.meta.env.SITE + imageUrlEnd;
  }

  return imageUrl;
};
