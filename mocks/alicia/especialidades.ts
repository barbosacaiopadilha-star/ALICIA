import { medicos } from "@/mocks/alicia/medicos";

interface EspecialidadeBase {
  id: string;
  nome: string;
  icone: string;
}

export const especialidadesBase: EspecialidadeBase[] = [
  { id: "ortopedia", nome: "Ortopedia", icone: "bone" },
  { id: "cardiologia", nome: "Cardiologia", icone: "heart-pulse" },
  { id: "dermatologia", nome: "Dermatologia", icone: "sparkles" },
  { id: "ginecologia", nome: "Ginecologia", icone: "venus" },
  { id: "pediatria", nome: "Pediatria", icone: "baby" },
  { id: "neurologia", nome: "Neurologia", icone: "brain" },
  { id: "neurocirurgia", nome: "Neurocirurgia", icone: "brain-circuit" },
  { id: "oftalmologia", nome: "Oftalmologia", icone: "eye" },
  { id: "urologia", nome: "Urologia", icone: "droplets" },
  { id: "oncologia", nome: "Oncologia", icone: "radiation" },
  { id: "psiquiatria", nome: "Psiquiatria", icone: "activity" },
  { id: "endocrinologia", nome: "Endocrinologia", icone: "flask-conical" },
];

// Quantidade de médicos por estado, derivada diretamente do mock real de
// médicos (mocks/alicia/medicos.ts) — não são mais números fixos digitados
// à parte. Combinações sem nenhum médico simplesmente não aparecem aqui e
// resultam em quantidade 0 ("Em breve") no service.
export const quantidadePorEstado: Record<string, Record<string, number>> = medicos.reduce(
  (acc, medico) => {
    const estado = medico.estadoSigla;
    const especialidade = medico.especialidadeId;
    acc[estado] = acc[estado] ?? {};
    acc[estado][especialidade] = (acc[estado][especialidade] ?? 0) + 1;
    return acc;
  },
  {} as Record<string, Record<string, number>>
);
