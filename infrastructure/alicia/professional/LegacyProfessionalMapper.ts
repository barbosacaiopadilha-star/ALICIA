import type { Medico } from "@/types/alicia/medico";
import { Identity } from "@/domain/professional/Identity";
import { Professional } from "@/domain/professional/Professional";

/**
 * Converte um registro legado (Medico, de types/alicia/medico.ts) em uma
 * instância válida de Professional.
 *
 * Os mocks atuais (mocks/alicia/medicos.ts) não possuem council, number,
 * state, status nem data de verificação de registro profissional — por
 * isso nenhuma Registration é criada aqui. Nenhum dado é inventado.
 */
export class LegacyProfessionalMapper {
  static toDomain(input: Medico): Professional {
    const identity = Identity.create({
      fullName: input.nome,
      photoUrl: input.fotoUrl,
    });

    return Professional.create({
      id: input.id,
      identity,
    });
  }
}
