import { Hero } from "@/components/sections/Hero";
import { ChoicesReveal } from "@/components/sections/ChoicesReveal";
import { HiddenStep } from "@/components/sections/HiddenStep";
import { LearnedToChoose } from "@/components/sections/LearnedToChoose";
import { CurationFlow } from "@/components/sections/CurationFlow";
import { WhyThree } from "@/components/sections/WhyThree";
import { Manifesto } from "@/components/sections/Manifesto";
import { Movement } from "@/components/sections/Movement";
import { FinalCta } from "@/components/sections/FinalCta";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Hero />
      <ChoicesReveal />
      <HiddenStep />
      <LearnedToChoose />
      <CurationFlow />
      <WhyThree />
      <Manifesto />
      <Movement />
      <FinalCta />
      <Footer />
    </main>
  );
}
