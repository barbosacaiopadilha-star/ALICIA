import { Reveal } from "@/components/Reveal";

// Os assets finais (public/media/manifesto.mp4 e manifesto-poster.jpg) ainda
// não existem no repositório. Enquanto não forem adicionados, a seção usa um
// fundo sólido da identidade para não gerar 404 nem quebrar o layout; ao
// receber os arquivos, restaurar aqui o <video> com poster.
export function Manifesto() {
  return (
    <section className="section relative overflow-hidden !p-0" aria-label="Manifesto">
      <div className="absolute inset-0 bg-ink">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(169,130,79,0.18),transparent_65%)]"
        />
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
