import type { ResultadoDeCompatibilidade } from "@/domain/curadoria";

/**
 * Porta de avaliação de critério (Epic C2, CURADORIA_MODEL.md §4).
 *
 * O motor de elegibilidade NÃO conhece perfis de profissionais: quem
 * fornece avaliadores (curador/infraestrutura, waves futuras) fecha
 * sobre os dados. Cada avaliador responde, para um profissional, um
 * resultado CATEGÓRICO com as evidências que o sustentam — nunca um
 * número (decisão nº 2 do Release Book).
 */
export interface AvaliacaoDeCriterio {
  readonly resultado: ResultadoDeCompatibilidade;
  readonly evidenciaIds: ReadonlyArray<string>;
}

export interface AvaliadorDeCriterio {
  readonly criterioId: string;
  avaliar(professionalId: string): AvaliacaoDeCriterio;
}
