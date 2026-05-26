import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "Christopher A. Rotunno",
  // Your website's title and description (meta fields)
  title:
    "Christopher A. Rotunno — Data Analytics Engineer & BI Leader",
  description:
    "Data analytics engineer and BI leader with experience turning raw data into decisions. Portfolio of dashboards, data pipelines, and analytical projects. Based in St. Augustine, FL.",

  // Your information for blog post purposes
  author: {
    name: "Christopher A. Rotunno",
    email: "chrisrotunno@icloud.com",
    twitter: "chrisrotunno",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/og-banner.jpg",
    alt: "Christopher A. Rotunno — Data Analytics Engineer & BI Leader",
  },
};

export default siteData;
