import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const profile = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/profile" }),
  schema: z.object({
    name: z.string(),
    avatarUrl: z.string(),
    bio: z.string(),
    twitterHandle: z.string(),
    contact: z.object({
      email: z.string(),
      phone: z.string(),
      location: z.string(),
      linkedin: z.string(),
      github: z.string(),
      cal: z.string().optional(),
    }),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/projects" }),
  schema: z.object({
    order: z.number(),
    name: z.string(),
    description: z.string(),
    technologies: z.array(z.string()),
    repo: z.string().optional(),
    live_url: z.string().optional(),
    img_url: z.string(),
    features: z.array(z.string()).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string().optional().default("Uncategorized"),
    featured: z.boolean().optional().default(false),
  }),
});

export const collections = {
  profile,
  projects,
  blog,
};
