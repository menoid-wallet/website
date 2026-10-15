import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DocPage from "@/components/docs/DocPage";
import { V05_CONTENT } from "@/components/docs/V05Docs";
import { docMetadata } from "@/components/docs/metadata";
import { BOOKS } from "@/components/docs/pages";

type Props = { params: Promise<{ slug: string }> };

// every V0.5 page is built ahead of time; any other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return BOOKS["v0.5"].pages.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return docMetadata("v0.5", (await params).slug);
}

export default async function V05DocsPage({ params }: Props) {
  const { slug } = await params;
  const Body = V05_CONTENT[slug];
  if (!slug || !Body) notFound();
  return (
    <DocPage version="v0.5" slug={slug}>
      <Body />
    </DocPage>
  );
}
