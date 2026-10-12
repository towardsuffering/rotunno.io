// Static search index for the nav search (src/components/nav/search/SiteSearch.astro):
// site sections and pages, capabilities, FAQ answers, and blog posts.
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

import faqData from "@/config/en/faqData.json";
import { defaultLocale } from "@/config/siteSettings.json";
import { getAllPosts } from "@/js/blogUtils";

export const prerender = true;

type Entry = { t: string; d: string; u: string; k: string; g: string[]; y?: number };

const strip = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const SECTIONS: Entry[] = [
  { k: "Section", t: "Core Capabilities", d: "Empowering others, finding structure, troubleshooting systems, and predicting patterns.", u: "/#capabilities-cards", g: ["skills", "services", "strengths"] },
  { k: "Section", t: "About Christopher", d: "People, not platforms. Organizational fluency. Technical depth.", u: "/#team-swiper", g: ["about", "bio", "experience", "skills"] },
  { k: "Section", t: "Companies I've Worked With", d: "Organizations across lending, retail, restaurants, and data.", u: "/#company-marquee-section", g: ["experience", "clients", "employers"] },
  { k: "Section", t: "Frequently Asked Questions", d: "Roles, industries, tech stack, remote work, and how to get in touch.", u: "/#faq", g: ["faq", "questions"] },
  { k: "Section", t: "Latest from the Blog", d: "The newest analysis on markets, policy, and analytics.", u: "/#latest-posts", g: ["blog", "articles", "insights"] },
  { k: "Section", t: "Contact: Drop Me a Line", d: "Send a message about a role, a project, or a question.", u: "/#contact", g: ["contact", "email", "hire", "message", "phone"] },
  { k: "Page", t: "About", d: "Background, approach, and what I bring to every data role.", u: "/about/", g: ["about", "bio"] },
  { k: "Page", t: "Resume", d: "Education, experience, and certifications.", u: "/resume/", g: ["cv", "experience", "education", "work history"] },
  { k: "Page", t: "Blog", d: "All articles on data, markets, policy, and analytics engineering.", u: "/blog/", g: ["articles", "posts", "writing"] },
  { k: "Page", t: "Support My Work", d: "Ways to support the writing and analysis on this site.", u: "/support/", g: ["donate", "support", "tip"] },
  { k: "Page", t: "Privacy Policy", d: "How cookies, analytics, ads, and comments are handled.", u: "/privacy/", g: ["privacy", "cookies", "legal"] },
];

const CAPABILITIES = ["empowering-others", "finding-structure", "troubleshooting-systems", "predicting-patterns"];

export const GET: APIRoute = async () => {
  const services = await getCollection("services", ({ id }) => CAPABILITIES.some((slug) => id.includes(slug)) && id.startsWith("en"));
  const capabilities: Entry[] = services.map((s) => ({
    k: "Capability",
    t: s.data.title,
    d: s.data.description,
    u: `/capabilities/${CAPABILITIES.find((slug) => s.id.includes(slug))}/`,
    g: ["capabilities", "skills"],
  }));

  const faqs: Entry[] = faqData.map((f) => ({
    k: "FAQ",
    t: f.question,
    d: strip(f.answer).slice(0, 220),
    u: "/#faq",
    g: ["faq"],
  }));

  const posts = await getAllPosts(defaultLocale);
  const articles: Entry[] = posts.map((p) => ({
    k: "Post",
    t: p.data.title,
    d: p.data.description,
    u: `/blog/${p.id}/`,
    g: [...p.data.categories, ...p.data.tags],
    y: p.data.pubDate.getFullYear(),
  }));

  return new Response(JSON.stringify([...SECTIONS, ...capabilities, ...faqs, ...articles]), {
    headers: { "content-type": "application/json" },
  });
};
