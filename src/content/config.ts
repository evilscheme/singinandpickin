import { defineCollection, z } from 'astro:content';

const songsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    artist: z.string(),
    date: z.date(),
    month: z.string(),
    year: z.number(),
    key: z.string().optional(),
    picker: z.string(),
    youtubeUrl: z.string().url().optional(),
    chordsUrl: z.string().url().optional(),
    printableUrl: z.string().url().optional(),
    spotifyUrl: z.string().url().optional(),
    appleMusicUrl: z.string().url().optional(),
    coverImage: z.string().optional(),
  }),
});

export const collections = {
  songs: songsCollection,
};
