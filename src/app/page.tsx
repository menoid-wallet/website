import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WalletModes from "@/components/WalletModes";
import Chains from "@/components/Chains";
import Roadmap from "@/components/Roadmap";
import Footer from "@/components/Footer";
import DownloadModal from "@/components/DownloadModal";

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <WalletModes />
        <Chains />
        {/* Roadmap closes with the download CTA — same section, same rain. */}
        <Roadmap />
      </main>
      <Footer />
      {/* One sheet for the whole page — the nav, the hero and the closing
          section all open this same instance. */}
      <DownloadModal />
    </>
  );
}
