import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Christopher A. Rotunno",
  // Your website's title and description (meta fields)
  title:
    "Christopher A. Rotunno | Data Analytics Engineer & BI Leader",
  description:
    "Analytics engineer turned sales leader: data pipelines, dashboards, and the client trust that turns insight into results. Based in St. Augustine, FL.",

  // Your information for blog post purposes
  author: {
    name: "Christopher A. Rotunno",
    email: "chrisrotunno@icloud.com",
    twitter: "chrisrotunno",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/og-social-v2.jpg",
    alt: "Christopher A. Rotunno | Data Analytics Engineer & BI Leader",
  },
};

export default siteData;
