import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { universeSchema } from "@/schemas/universe-schema";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const GENRES = ["High Fantasy", "Sci-Fi", "Urban Fantasy", "Historical", "Horror", "Lainnya"];

export function CreateUniversePage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(universeSchema),
    defaultValues: { name: "", genre: "", description: "" },
  });

  function onSubmit() {
    setSubmitted(true);
    setTimeout(() => navigate("/universes"), 600);
  }

  return (
    <>
      <PageHeader
        title="Create Universe"
        description="Tentukan identitas dasar dunia kamu. Nama, genre, dan gambaran besar yang jadi fondasi lore."
      />

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Identitas universe</CardTitle>
          <CardDescription>
            Form ini sudah tervalidasi dengan Zod. Data baru tersimpan saat backend terhubung.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium">Nama universe</label>
              <Input id="name" placeholder="cth. Aethermoor" {...register("name")} />
              {errors.name ? <p className="text-xs text-destructive">{errors.name.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="genre" className="text-sm font-medium">Genre</label>
              <select
                id="genre"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("genre")}
              >
                <option value="">Pilih genre...</option>
                {GENRES.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              {errors.genre ? <p className="text-xs text-destructive">{errors.genre.message}</p> : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium">Deskripsi</label>
              <textarea
                id="description"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Gambaran besar dunia kamu (20-500 karakter)"
                {...register("description")}
              />
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              ) : null}
            </div>

            <Button type="submit" disabled={isSubmitting || submitted}>
              {submitted ? "Dibuat (mock)..." : isSubmitting ? "Menyimpan..." : "Buat universe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
