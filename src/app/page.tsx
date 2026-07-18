import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WalletModes from "@/components/WalletModes";
import Chains from "@/components/Chains";
import Roadmap from "@/components/Roadmap";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <WalletModes />
        <Chains />
        {/* Roadmap closes with the waitlist — same section, same rain. */}
        <Roadmap />
      </main>
      <Footer />
    </>
  );
}
