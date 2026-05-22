import { glob } from "astro/loaders";
import { defineCollection, reference } from "astro:content";
import { z } from "astro/zod";

// Type-check frontmatter using a schema
const blogCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      // reference the authors collection https://docs.astro.build/en/guides/content-collections/#defining-collection-references
      authors: z.array(reference("authors")),
      // Transform string to Date object
      pubDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      updatedDate: z
        .string()
        .or(z.date())
        .optional()
        .transform((str) => (str ? new Date(str) : undefined)),
      heroImage: image().optional(),
      categories: z.array(z.string()),
      tags: z.array(z.string()),
      // mappingKey allows you to match entries across languages for SEO purposes
      mappingKey: z.string().optional(),
      // blog posts will be excluded from build if draft is "true"
      draft: z.boolean().optional(),
    }),
});

// authors
const authorsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/authors" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      avatar: image(),
      about: z.string(),
      email: z.string(),
      authorLink: z.string(), // author page link. Could be a personal website, github, twitter, whatever you want
    }),
});

// services collection
const servicesCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/services" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      titleLong: z.string(),
      description: z.string(),
      icon: z.string(),
      image: image(),
      price: z.string().optional(),
      size: z.string().optional(),
      mappingKey: z.string().optional(),
      order: z.number().optional(),
      draft: z.boolean().optional(),
    }),
});

// careers/job postings
const careersCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/careers" }),
  schema: () =>
    z.object({
      title: z.string(),
      category: z.string(),
      location: z.string(),
      type: z.enum(["Full-time", "Part-time", "Contract", "Remote"]),
      description: z.string(),
      requirements: z.array(z.string()),
      applicationUrl: z.url(),
      publishDate: z
        .string()
        .or(z.date())
        .transform((val) => new Date(val)),
      // mappingKey allows you to match entries across languages for SEO purposes
      mappingKey: z.string().optional(),
      draft: z.boolean().optional().default(false),
    }),
});

// projects
const projectsCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      image: image(),
      technologies: z.array(z.string()),
      demoUrl: z.url().optional(),
      githubUrl: z.url().optional(),
      completionDate: z.date(),
      keyFeatures: z.array(z.string()),
      order: z.number().optional(),
      mappingKey: z.string().optional(),
      draft: z.boolean().optional(),
    }),
});

// resume
const resumeCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*.{json,jsonc}", base: "./src/data/resume" }),
  schema: ({ image }) =>
    z.object({
      diplomas: z.array(
        z.object({
          title: z.string(),
          school: z.string(),
          year: z.number(),
        }),
      ),
      certifications: z.array(
        z.object({
          title: z.string(),
          year: z.number(),
        }),
      ),
      experience: z.array(
        z.object({
          title: z.string(),
          company: z.string(),
          companyImage: image(),
          dates: z.string(),
          location: z.string(),
          responsibilities: z.array(z.string()),
        }),
      ),
      hardSkills: z.array(
        z.object({
          skill: z.string(),
          percentage: z.number().min(0).max(100),
        }),
      ),
      softSkills: z.array(
        z.object({
          skill: z.string(),
          icon: z.string(),
        }),
      ),
      languages: z.array(
        z.object({
          language: z.string(),
          level: z.number().min(1).max(10),
        }),
      ),
      tools: z.array(
        z.object({
          name: z.string(),
          category: z.string(),
          image: image(),
          link: z.url(),
        }),
      ),
      mappingKey: z.string().optional(),
    }),
});

// other pages
const otherPagesCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/otherPages" }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      // mappingKey allows you to match entries across languages for SEO purposes
      mappingKey: z.string().optional(),
      draft: z.boolean().optional(),
    }),
});

// each code toggle section is it's own content file
const codeToggleCollection = defineCollection({
  loader: glob({ pattern: "**/[^_]*{md,mdx}", base: "./src/data/codeToggles" }),
  schema: () =>
    z.object({
      language: z.string(),
      order: z.number(),
      icon: z.string().optional(),
      draft: z.boolean().optional(),
    }),
});

export const collections = {
  blog: blogCollection,
  authors: authorsCollection,
  services: servicesCollection,
  careers: careersCollection,
  projects: projectsCollection,
  resume: resumeCollection,
  otherPages: otherPagesCollection,
  codeToggles: codeToggleCollection,
};
