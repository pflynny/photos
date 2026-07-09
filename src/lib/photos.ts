import type { ImageMetadata } from "astro";
import metadata from "../data/photos.json";

export interface Photo {
  file: string;
  image: ImageMetadata;
  title: string;
  alt: string;
  tags: string[];
}

interface PhotoMeta {
  title?: string;
  tags?: string[];
  alt?: string;
}

// Every image dropped into src/photos appears on the site automatically.
const images = import.meta.glob<{ default: ImageMetadata }>(
  "../photos/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}",
  { eager: true },
);

function titleFromFilename(file: string): string {
  return file.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function getPhotos(): Photo[] {
  const meta = metadata as Record<string, PhotoMeta | string>;
  const photos = Object.entries(images).map(([path, mod]) => {
    const file = path.split("/").pop()!;
    const entry = meta[file];
    const m: PhotoMeta = typeof entry === "object" ? entry : {};
    const title = m.title ?? titleFromFilename(file);
    return {
      file,
      image: mod.default,
      title,
      alt: m.alt ?? title,
      tags: (m.tags ?? []).map((t) => t.toLowerCase()),
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
