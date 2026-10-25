import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "The Starter",
  // Your website's title and description (meta fields)
  title:
    "The Starter - The kitchen sink starter for SaaS, Services, Portfolio, Blog, and more websites. Remove what you don't need and deploy.",
  description:
    "Create an amazing website for your small business clients with our beautiful website theme designed using Astro and Tailwind CSS. Perfect for freelancers, developers, startups, and personal use.",

  // Your information for blog post purposes
  author: {
    name: "Cosmic Themes",
    email: "creator@cosmicthemes.com",
    twitter: "Cosmic_Themes",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/og-social-v9.jpg",
    alt: "Christopher A. Rotunno, analytics engineer: turning fragmented tidbits into confidence. Scattered stars flow together into a chart whose line climbs to the brightest star.",
  },
};

export default siteData;
