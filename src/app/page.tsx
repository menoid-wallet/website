import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WalletModes from "@/components/WalletModes";
import WaitlistCTA from "@/components/WaitlistCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <WalletModes />
        <WaitlistCTA />
      </main>
      <Footer />
    </>
  );
}
