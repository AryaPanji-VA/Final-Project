import { z } from "zod";

/** The six categories the encyclopedia organises entries into. */
export const LORE_CATEGORIES = [
  "Character",
  "Location",
  "Faction",
  "Artifact",
  "Mythology",
  "Event",
];

/** Legend is deliberately non-canonical: a story the world tells about itself. */
export const CANON_STATUSES = [
  { value: "canon", label: "Canon — established" },
  { value: "draft", label: "Draft — not yet settled" },
  { value: "legend", label: "Legend — told, not confirmed" },
];

export const MAX_TAGS = 8;

export const loreSchema = z.object({
  title: z
    .string()
    .min(3, "Entry title must be at least 3 characters")
    .max(80, "Entry title must be 80 characters or fewer"),
  category: z.enum(["Character", "Location", "Faction", "Artifact", "Mythology", "Event"], {
    message: "Choose a category",
  }),
  canon: z.enum(["canon", "draft", "legend"], { message: "Choose a canon status" }),
  summary: z
    .string()
    .min(20, "Write a summary of at least 20 characters")
    .max(240, "Summary must be 240 characters or fewer"),
  content: z.string().min(40, "Write at least 40 characters of entry text"),
});

export const eventSchema = z.object({
  era: z.string().min(2, "Name the era this event belongs to").max(60, "Era name is too long"),
  date: z.string().min(1, "Give the event a date or year").max(40, "Date is too long"),
  title: z.string().min(3, "Event title must be at least 3 characters").max(90, "Title is too long"),
  description: z
    .string()
    .min(20, "Describe the event in at least 20 characters")
    .max(400, "Description must be 400 characters or fewer"),
});
