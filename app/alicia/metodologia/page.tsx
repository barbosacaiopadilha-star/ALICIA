import Link from "next/link";
import { getMetodologia } from "@/services/alicia/metodologia";
import { MetodologiaIntro } from "@/components/alicia/MetodologiaIntro";
import { CriterioMetodologia } from "@/components/alicia/CriterioMetodologia";
import { FontesMetodologia } from "@/components/alicia/FontesMetodologia";
import { LimitesMetodologia } from "@/components/alicia/LimitesMetodologia";

export default async function MetodologiaPage() {
  const metodologia = await getMetodologia();

  return (
    <section className="flex flex-col items-center gap-12 px-6 py-16 sm:px-10">
      <MetodologiaIntro
        versao={metodologia.versao}
        atualizadoEm={metodologia.atualizadoEm}
        resumo={metodologia.resumo}
      />

      <div className="flex w-full max-w-2xl flex-col gap-4">
        <h2 className="font-display text-2xl font-normal text-ink">Critérios de análise</h2>
        <ul className="flex flex-col gap-4">
          {metodologia.criterios.map((criterio) => (
            <CriterioMetodologia key={criterio.id} criterio={criterio} />
          ))}
        </ul>
      </div>

      <FontesMetodologia fontes={metodologia.fontes} />

      <div className="flex w-full max-w-2xl flex-col gap-4">
        <h2 className="font-display text-2xl font-normal text-ink">
          O que a AliCIA ainda não avalia
        </h2>
        <p className="text-sm text-ink-soft">
          A formação é apenas uma dimensão da escolha médica. Estes itens ainda não fazem parte da
          análise da AliCIA:
        </p>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {metodologia.naoAvaliado.map((item) => (
            <li key={item} className="border border-hairline bg-canvas px-3 py-2 text-sm text-ink-soft">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <LimitesMetodologia limites={metodologia.limites} />

      <div className="flex w-full max-w-2xl flex-col items-center gap-3 border-t border-hairline pt-8 text-center">
        <h2 className="font-display text-xl font-normal text-ink">
          Transparência antes da classificação
        </h2>
        <p className="text-sm text-ink-soft">
          Antes de criar rankings ou recomendações, a AliCIA precisa tornar seus critérios
          públicos, compreensíveis e auditáveis.
        </p>
        <Link
          href="/alicia"
          className="mt-2 inline-flex items-center justify-center border border-gold px-6 py-3 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:bg-gold hover:text-paper"
        >
          Voltar para a AliCIA
        </Link>
      </div>
    </section>
  );
}
