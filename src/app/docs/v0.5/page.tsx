import DocPage from "@/components/docs/DocPage";
import { V05Hero, V05_CONTENT } from "@/components/docs/V05Docs";
import { docMetadata } from "@/components/docs/metadata";

export const metadata = docMetadata("v0.5", "");

export default function DocsV05Home() {
  const Body = V05_CONTENT[""];
  return (
    <DocPage version="v0.5" slug="" hero={<V05Hero />}>
      <Body />
    </DocPage>
  );
}
