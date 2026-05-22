import { type SiteDataProps } from "../types/configDataTypes";

// Update this file with your site specific information
const siteData: SiteDataProps = {
  name: "WaterLimon Dewds",
  // Your website's title and description (meta fields)
  title:
    "WaterLimon Dewds — Home of the Ancient City Splash",
  description:
    "At every market, trade show, and carnival you've been to, you grabbed a soda or lemonade. We're on a mission to change that reflex. The Ancient City Splash — watermelon, lime, ice, and a dash of salt. Named for Saint Augustine, the nation's oldest city. One event at a time.",

  // Your information for blog post purposes
  author: {
    name: "WaterLimon Dewds",
    email: "chrisrotunno@icloud.com",
    twitter: "WatermelonLimeLLC",
  },

  // default image for meta tags if the page doesn't have an image already
  defaultImage: {
    src: "/images/og-default.jpg",
    alt: "WaterLimon Dewds — Home of the Ancient City Splash",
  },
};

export default siteData;
