import type { KnowledgeClaim } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";
import type { ProfessionalRepository } from "@/domain/professional/repositories/ProfessionalRepository";

export interface GetPublishedKnowledgeClaimsByProfessionalInput {
  professionalId: string;
}

export class GetPublishedKnowledgeClaimsByProfessional {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly knowledgeClaimRepository: KnowledgeClaimRepository
  ) {}

  async execute(
    input: GetPublishedKnowledgeClaimsByProfessionalInput
  ): Promise<ReadonlyArray<KnowledgeClaim>> {
    const professional = await this.professionalRepository.findById(input.professionalId);
    if (!professional) {
      throw new Error("GetPublishedKnowledgeClaimsByProfessional professional not found.");
    }

    const claims = await this.knowledgeClaimRepository.findByProfessionalId(
      input.professionalId
    );

    return claims.filter((claim) => claim.editorialStatus.value === "published");
  }
}
