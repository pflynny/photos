import { fileURLToPath } from "node:url";
import type { ImageMetadata } from "astro";
import exifr from "exifr";
import metadata from "../data/photos.json";

export interface Photo {
  file: string;
  slug: string;
  image: ImageMetadata;
  title: string;
  alt: string;
  tags: string[];
  year: number | null;
  caption: string | null;
}

interface PhotoMeta {
  title?: string;
  tags?: string[];
  alt?: string;
  year?: number;
  caption?: string;
}

function yearFromFilename(file: string): number | null {
  const m = file.match(/^((?:19|20)\d{2})\D/);
  return m ? Number(m[1]) : null;
}

// Every image dropped into src/photos appears on the site automatically.
const images = import.meta.glob<{ default: ImageMetadata }>(
  "../photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);

function titleFromFilename(file: string): string {
  return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

function slugFromFilename(file: string): string {
  return file
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getPhotos(): Photo[] {
  const meta = metadata as Record<string, PhotoMeta | string>;
  const seenSlugs = new Set<string>();
  const photos = Object.entries(images).map(([path, mod]) => {
    const file = path.split("/").pop()!;
    const entry = meta[file];
    const m: PhotoMeta = typeof entry === "object" ? entry : {};
    const title = m.title ?? titleFromFilename(file);
    // Filenames are unique, but slugging can collide ("Pier 1.jpg" vs
    // "pier-1.png") — suffix until distinct.
    let slug = slugFromFilename(file);
    while (seenSlugs.has(slug)) slug += "-2";
    seenSlugs.add(slug);
    return {
      file,
      slug,
      image: mod.default,
      title,
      alt: m.alt ?? title,
      tags: (m.tags ?? []).map((t) => t.toLowerCase()),
      year: m.year ?? yearFromFilename(file),
      caption: m.caption ?? null,
    };
  });
  // Reverse filename order, so a date-prefixed naming scheme
  // (2026-07-09-harbour.jpg) shows the newest photos first.
  photos.sort((a, b) => b.file.localeCompare(a.file));
  return photos;
}

export function getAllTags(photos: Photo[]): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of photos) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => a.tag.localeCompare(b.tag));
}

// Camera settings for a photo's page, read from its EXIF at build time.
// Photos without EXIF (scans, exports that strip it) return [] and the
// page simply omits the line.
export async function getExifParts(photo: Photo): Promise<string[]> {
  const path = fileURLToPath(new URL(`../photos/${photo.file}`, import.meta.url));
  let data: Record<string, unknown> | undefined;
  try {
    data = await exifr.parse(path, [
      "Make", "Model", "LensModel", "FNumber", "ExposureTime", "ISO", "FocalLength",
    ]);
  } catch {
    return [];
  }
  if (!data) return [];

  const parts: string[] = [];
  const make = data.Make as string | undefined;
  const model = data.Model as string | undefined;
  if (model) {
    // Avoid "Canon Canon EOS R6" — many makers repeat themselves in Model.
    const redundant = make && model.toLowerCase().includes(make.toLowerCase().split(" ")[0]);
    parts.push(redundant || !make ? model : `${make} ${model}`);
  }
  if (typeof data.LensModel === "string" && data.LensModel !== model) parts.push(data.LensModel);
  if (typeof data.FocalLength === "number") parts.push(`${Math.round(data.FocalLength)}mm`);
  if (typeof data.FNumber === "number") parts.push(`f/${data.FNumber}`);
  if (typeof data.ExposureTime === "number") {
    parts.push(data.ExposureTime >= 1 ? `${data.ExposureTime}s` : `1/${Math.round(1 / data.ExposureTime)}s`);
  }
  if (typeof data.ISO === "number") parts.push(`ISO ${data.ISO}`);
  return parts;
}

export function getAllYears(photos: Photo[]): { year: number; count: number }[] {
  const counts = new Map<number, number>();
  for (const p of photos) {
    if (p.year !== null) counts.set(p.year, (counts.get(p.year) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year); // newest first
}
