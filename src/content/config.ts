import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    published_date: z.string(),
    updated_date: z.string().optional(),
    author: z.string(),
    author_bio: z.string().optional(),
    category: z.string(),
    featured_image_url: z.string().optional(),
    meta_title: z.string().optional(),
    meta_description: z.string().optional(),
    faq: z.array(z.object({
      question: z.string(),
      answer: z.string()
    })).optional(),
    speakable: z.object({
      cssSelector: z.array(z.string())
    }).optional()
  })
});

export const collections = { blog };