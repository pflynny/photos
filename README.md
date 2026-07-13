# Photographs

A personal photography site. Static, fast, no database, no CMS — photos live
in a folder, metadata lives in one JSON file, and Netlify rebuilds the site on
every push.

## Adding a photo

1. Copy the image (JPG, PNG, or WebP — any size, any aspect ratio) into
   `src/photos/`. Prefix the filename with the date if you want newest-first
   ordering, e.g. `2026-07-09-harbour-wall.jpg`.
2. *(Optional)* Give it a title and tags in `src/data/photos.json`:

   ```json
   "2026-07-09-harbour-wall.jpg": { "title": "Harbour wall", "tags": ["sea"] }
   ```

   Photos without an entry still appear — untagged, titled from the filename.

   Photos are also filterable by year (the "Year ▾" button next to the tags).
   The year comes from a `YYYY-` filename prefix automatically, or set it
   explicitly with `"year": 2026` in the photo's `photos.json` entry.

   Every photo also gets its own shareable page at `/photo/<filename-slug>/`
   (e.g. `/photo/2026-07-09-harbour-wall/`), generated automatically — reach
   it via the "photo page" link in the lightbox. The photo page also shows:

   - an optional `"caption"` from `photos.json` — a sentence or two about
     the photograph;
   - camera settings (camera, lens, focal length, aperture, shutter, ISO),
     read automatically from the photo's EXIF at build time. Photos without
     EXIF simply omit the line.

   The whole site follows the visitor's system light/dark preference, and
   images block right-click/drag saving (a deterrent only — anyone
   determined can still save them).
3. Commit and push. Netlify rebuilds and deploys automatically.

That's the whole workflow. Full-resolution originals go in the folder; the
build generates responsive, optimized WebP versions automatically, so nothing
needs resizing by hand.

Note: iPhone HEIC files won't display in browsers — convert to JPEG first
(`sips -s format jpeg photo.heic --out photo.jpg` keeps the EXIF). Zero-pad
dates in filenames (`2025-03-31`, not `2025-3-31`) or ordering goes wrong.

## Image resolution cap

Originals are never published. Every image the site serves is capped at
**1600px on the long edge** (`MAX_EDGE` in `src/lib/photos.ts`) — sharp on
screens, too small for quality prints or resale. Raise or lower the constant
and push to change the ceiling.

## Password protection

The site is gated with a password prompt when the `SITE_PASSWORD`
environment variable is set in Netlify (**Site configuration → Environment
variables**, then trigger a redeploy). Visitors enter any username and that
password. Remove the variable and redeploy to open the site again. Local
dev is never gated. Implemented in `netlify/edge-functions/auth.ts`.

## Removing a photo

Delete the file from `src/photos/` (and its `photos.json` entry, if it has
one), then push.

## Changing the site name / title / about text

Edit `src/data/site.json`. The `about` text appears at `/about/`, linked
from the footer.

## Running locally

```sh
npm install
npm run dev        # http://localhost:4321
```

## Deploying to Netlify

One-time setup:

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
3. Netlify reads `netlify.toml` — no settings needed. Deploy.

4. Set `SITE_PASSWORD` in the site's environment variables to enable the
   password gate (see above).

Every subsequent `git push` deploys automatically.
