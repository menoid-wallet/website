import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WalletModes from "@/components/WalletModes";
import Chains from "@/components/Chains";
import MenoSection from "@/components/MenoSection";
import Roadmap from "@/components/Roadmap";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";
import CursorParticles from "@/components/CursorParticles";

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <WalletModes />
        <Chains />
        <div className="relative">
          <CursorParticles zIndexClass="z-[2]" />
          <MenoSection />
        </div>
        <Roadmap />
        <div className="relative">
          <CursorParticles zIndexClass="z-[2]" />
          <WaitlistCTA />
        </div>
      </main>
      <Footer />
    </>
  );
}
