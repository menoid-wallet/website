import type { Metadata } from "next";
import { notFound } from "next/navigation";

import DocPage from "@/components/docs/DocPage";
import { V1_CONTENT } from "@/components/docs/V1Docs";
import { docMetadata } from "@/components/docs/metadata";
import { BOOKS } from "@/components/docs/pages";

type Props = { params: Promise<{ slug: string }> };

// every V1 page is built ahead of time; any other slug is a 404
export const dynamicParams = false;

export function generateStaticParams() {
  return BOOKS.v1.pages.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return docMetadata("v1", (await params).slug);
}

export default async function V1DocsPage({ params }: Props) {
  const { slug } = await params;
  const Body = V1_CONTENT[slug];
  if (!slug || !Body) notFound();
  return (
    <DocPage version="v1" slug={slug}>
      <Body />
    </DocPage>
  );
}
