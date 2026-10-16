import type { Metadata } from "next";

import { locate, type DocVersion } from "./pages";

/** Title and description of one docs page; the docs layout adds " — Menoid Docs" to the title. */
export function docMetadata(version: DocVersion, slug: string): Metadata {
  const { book, page } = locate(version, slug);
  if (!page) return {};
  const title = slug ? `${page.label} · ${book.label}` : book.label;
  const shared = { title: `${title} — Menoid Docs`, description: page.description };
  return {
    // the docs layout's template only reaches child folders, not /docs itself
    title: version === "v1" && !slug ? { absolute: shared.title } : title,
    description: page.description,
    openGraph: { type: "article", siteName: "Menoid", ...shared },
    twitter: { card: "summary_large_image", ...shared },
  };
}
