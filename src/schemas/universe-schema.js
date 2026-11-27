import { z } from "zod";

export const GENRES = [
  "High Fantasy",
  "Low Fantasy",
  "Sci-Fi",
  "Urban Fantasy",
  "Historical",
  "Horror",
  "Mythic",
  "Other",
];

export const VISIBILITIES = [
  { value: "private", label: "Private — only you can read it" },
  { value: "public", label: "Public — listed in Discover" },
];

export const universeSchema = z.object({
  name: z
    .string()
    .min(3, "Universe name must be at least 3 characters")
    .max(60, "Universe name must be 60 characters or fewer"),
  genre: z.string().min(1, "Choose a genre"),
  visibility: z.enum(["private", "public"]),
  description: z
    .string()
    .min(20, "Describe the world in at least 20 characters")
    .max(500, "Description must be 500 characters or fewer"),
});
