import Image from "next/image";
import { Reveal } from "@/components/Reveal";

export function Manifesto() {
  return (
    <section className="section relative overflow-hidden !p-0" aria-label="Manifesto">
      <div className="absolute inset-0">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/manifesto-poster.jpg"
        >
          <source src="/media/manifesto.mp4" type="video/mp4" />
        </video>
        <Image
          src="/media/manifesto-poster.jpg"
          alt=""
          fill
          className="-z-10 object-cover"
          sizes="100vw"
          priority={false}
        />
        <div className="absolute inset-0 bg-ink/55" />
      </div>

      <Reveal className="relative z-10 max-w-editorial px-6 text-center">
        <p className="font-display text-2xl italic leading-relaxed text-paper sm:text-3xl md:text-4xl">
          O cuidado não começa quando entramos no consultório.
          <br />
          Começa quando escolhemos quem irá conduzir nossa história.
        </p>
      </Reveal>
    </section>
  );
}
