import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Christopher A. Rotunno",
  // Your website's title and description (meta fields)
  title:
    "Christopher A. Rotunno | Analytics Engineer · Super Intelligence",
  description:
    "Analytics engineer turning fragmented tidbits into confidence: messy data structured, patterns caught early, and answers made plain with AI. Plain-English writing, notebooks anyone can run, and a daily Tidbit of the Day. Based in St. Augustine, FL.",

  // Your information for blog post purposes
  author: {
    name: "Christopher A. Rotunno",
    email: "chrisrotunno@icloud.com",
    twitter: "chrisrotunno",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/og-social-v10.jpg",
    alt: "Christopher A. Rotunno, analytics engineer: turning fragmented tidbits into confidence. Scattered shards of data flow together into a chart whose line climbs to the brightest star.",
  },
};

export default siteData;
