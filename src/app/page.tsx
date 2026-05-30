import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Modes from "@/components/Modes";
import Privacy from "@/components/Privacy";
import Chains from "@/components/Chains";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Loader />
      <Nav />
      <main className="relative flex-1">
        <Hero />
        <Marquee />
        <Modes />
        <Privacy />
        <Chains />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
