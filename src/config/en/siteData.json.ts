import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Christopher A. Rotunno",
  // Your website's title and description (meta fields)
  title:
    "Christopher A. Rotunno | The Elvis of Super Intelligence",
  description:
    "Analytics engineer bringing super intelligence to the working class: plain-English writing, notebooks anyone can run, and a daily Tidbit of the Day. Based in St. Augustine, FL.",

  // Your information for blog post purposes
  author: {
    name: "Christopher A. Rotunno",
    email: "chrisrotunno@icloud.com",
    twitter: "chrisrotunno",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/og-social-v8.jpg",
    alt: "Christopher A. Rotunno, The Elvis of Super Intelligence: a broadcast microphone with a neural network for a grille, sending its signal to working professionals. I connect the working class to super intelligence",
  },
};

export default siteData;
