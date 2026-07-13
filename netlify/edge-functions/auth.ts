// Site-wide password gate (HTTP Basic Auth).
//
// Set a SITE_PASSWORD environment variable in Netlify
// (Site configuration → Environment variables) to enable it.
// Without the variable the site is served openly — local dev
// and deploy previews are unaffected.
//
// Any username is accepted; only the password is checked.

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const password = Deno.env.get("SITE_PASSWORD");
  if (!password) return context.next();

  const url = new URL(request.url);
  if (url.pathname === "/robots.txt") return context.next();

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const supplied = atob(header.slice(6)).split(":").slice(1).join(":");
      if (supplied === password) return context.next();
    } catch {
      // fall through to the 401
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Photographs", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
};

export const config = { path: "/*" };
