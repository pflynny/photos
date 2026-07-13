// Runs after `astro build`. The glob import in src/lib/photos.ts causes
// Vite to copy the ORIGINAL photos into dist/_astro even though nothing
// links to them. This deletes any published image whose long edge exceeds
// MAX_EDGE, guaranteeing full-resolution originals are never deployed.
//
// Keep MAX_EDGE in sync with src/lib/photos.ts.
import { readdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const MAX_EDGE = 1600;
const dir = new URL("../dist/_astro/", import.meta.url).pathname;

let pruned = 0;
for (const file of await readdir(dir)) {
  if (!/\.(jpe?g|png|webp|avif|gif|tiff?)$/i.test(file)) continue;
  const path = join(dir, file);
  const { width = 0, height = 0 } = await sharp(path).metadata();
  if (Math.max(width, height) > MAX_EDGE) {
    await unlink(path);
    pruned++;
    console.log(`pruned over-limit image: ${file} (${width}x${height})`);
  }
}
console.log(`prune-originals: ${pruned} file(s) removed, cap ${MAX_EDGE}px`);
