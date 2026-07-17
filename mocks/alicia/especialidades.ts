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

// Quantidade de médicos por estado. Estados fora deste mapa (ou
// especialidades ausentes dentro dele) resultam em quantidade 0 ("Em breve").
export const quantidadePorEstado: Record<string, Record<string, number>> = {
  SP: {
    ortopedia: 34,
    cardiologia: 21,
    dermatologia: 12,
    ginecologia: 18,
    pediatria: 27,
    neurologia: 9,
    neurocirurgia: 0,
    oftalmologia: 15,
    urologia: 7,
    oncologia: 6,
    psiquiatria: 11,
    endocrinologia: 8,
  },
  RJ: {
    ortopedia: 19,
    cardiologia: 14,
    dermatologia: 0,
    ginecologia: 10,
    pediatria: 16,
    neurologia: 5,
    neurocirurgia: 0,
    oftalmologia: 9,
    urologia: 0,
    oncologia: 3,
    psiquiatria: 6,
    endocrinologia: 4,
  },
};
