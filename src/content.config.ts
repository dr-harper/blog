import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: ['**/*.{md,mdx}', '!**/CLAUDE.md', '!**/AI_PROJECT_NOTES.md'], base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    author: z.string().default('Mikey Harper'),
    date: z.coerce.date(),
    slug: z.string(),
    description: z.string().default(''),
    tags: z.array(z.string()).default([]),
    headerImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: ['**/*.{md,mdx}', '!**/CLAUDE.md', '!**/AI_PROJECT_NOTES.md'], base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    slug: z.string(),
    status: z.enum(['active', 'completed', 'archived']).default('completed'),
    techStack: z.array(z.string()).default([]),
    liveUrl: z.string().optional(),
    repoUrl: z.string().optional(),
    headerImage: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = { blog, projects };
