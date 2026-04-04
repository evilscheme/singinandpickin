import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';

const extrasSchema = z.object({
  title: z.string(),
  url: z.url(),
  type: z.enum(['audio', 'video', 'youtube']).default('audio'),
});

const songsCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: 'src/content/songs' }),
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    date: z.date(),
    month: z.string(),
    year: z.number(),
    key: z.string().optional(),
    picker: z.string(),
    youtubeUrl: z.url().optional(),
    chordsUrl: z.url().optional(),
    printableUrl: z.url().optional(),
    spotifyUrl: z.url().optional(),
    appleMusicUrl: z.url().optional(),
    coverImage: z.string().optional(),
    extras: z.array(extrasSchema).optional(),
  }),
});

export const collections = {
  songs: songsCollection,
};
