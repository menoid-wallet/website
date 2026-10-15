import DocPage from "@/components/docs/DocPage";
import { V1Hero, V1_CONTENT } from "@/components/docs/V1Docs";
import { docMetadata } from "@/components/docs/metadata";

export const metadata = docMetadata("v1", "");

// the docs open on the version that is live: V1, on mainnet
export default function DocsHome() {
  const Body = V1_CONTENT[""];
  return (
    <DocPage version="v1" slug="" hero={<V1Hero />}>
      <Body />
    </DocPage>
  );
}
