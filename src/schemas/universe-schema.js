import { z } from "zod";

export const universeSchema = z.object({
  name: z.string().min(3, "Nama universe minimal 3 karakter"),
  genre: z.string().min(1, "Pilih genre universe"),
  description: z
    .string()
    .min(20, "Deskripsi minimal 20 karakter agar gambaran jelas")
    .max(500, "Deskripsi maksimal 500 karakter"),
});
