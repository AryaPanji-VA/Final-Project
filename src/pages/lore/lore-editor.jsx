import { useState } from "react";
import { Link, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { z } from "zod";

// Schema di sengaja didefinisikan inline untuk contoh; nanti pindah ke
// src/schemas saat struktur entri lore sudah final.
const loreEntrySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  category: z.string().min(1, "Pilih kategori"),
  content: z.string().min(30, "Isi entri minimal 30 karakter"),
});

const CATEGORIES = ["Character", "Location", "Faction", "Artifact", "Event"];

export function LoreEditorPage() {
  const { universeId, loreId } = useParams();
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loreEntrySchema),
    defaultValues: {
      title: "Ordo Penjaga Angin",
      category: "Faction",
      content:
        "Kesatria yang menambatkan pulau dengan layar raksasa, diwariskan dari generasi ke generasi lewat Kristal Lentera.",
    },
  });

  // Mock save: data belum tersimpan, backend menyusul di Minggu 5-8.
  function onSubmit() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <PageHeader
        title="Lore Editor"
        description={`Mengedit entri ${loreId} pada universe ${universeId}.`}
        actions={
          <Button variant="ghost" asChild>
            <Link to={`/universes/${universeId}/lore`}>Kembali ke encyclopedia</Link>
          </Button>
        }
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Entri lore</CardTitle>
          <CardDescription>Validasi Zod aktif. Penyimpanan masih mock.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium">Judul</label>
              <Input id="title" {...register("title")} />
              {errors.title ? <p className="text-xs text-destructive">{errors.title.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium">Kategori</label>
              <select
                id="category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("category")}
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category ? <p className="text-xs text-destructive">{errors.category.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="content" className="text-sm font-medium">Isi entri</label>
              <textarea
                id="content"
                rows={8}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("content")}
              />
              {errors.content ? <p className="text-xs text-destructive">{errors.content.message}</p> : null}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {saved ? "Tersimpan (mock)" : isSubmitting ? "Menyimpan..." : "Simpan entri"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
