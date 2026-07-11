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
   it via the "photo page" link in the lightbox.
3. Commit and push. Netlify rebuilds and deploys automatically.

That's the whole workflow. Full-resolution originals go in the folder; the
build generates responsive, optimized WebP versions automatically, so nothing
needs resizing by hand.

## Removing a photo

Delete the file from `src/photos/` (and its `photos.json` entry, if it has
one), then push.

## Changing the site name / title

Edit `src/data/site.json`.

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

Every subsequent `git push` deploys automatically.

## Placeholder photos

The `sample-*.png` files in `src/photos/` are generated placeholders so the
layout can be previewed. Delete them (and their entries in
`src/data/photos.json`) once real photos are in.
