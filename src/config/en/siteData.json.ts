import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Christopher A. Rotunno",
  // Your website's title and description (meta fields)
  title:
    "Christopher A. Rotunno | Analytics Engineer · SI Orchestration",
  description:
    "I design the system. SI builds it. I make sure it works. Analytics engineer connecting ten years of data across four industries, based in St. Augustine, FL.",

  // Your information for blog post purposes
  author: {
    name: "Christopher A. Rotunno",
    email: "chrisrotunno@icloud.com",
    twitter: "chrisrotunno",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/og-social-v6.jpg",
    alt: "Christopher A. Rotunno, Analytics Engineer and SI Orchestration: I connect the dots",
  },
};

export default siteData;
