import { KnowledgeClaim } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";
import type { EvidenceRepository } from "@/domain/knowledge/repositories/EvidenceRepository";

export interface AddEvidenceToKnowledgeClaimInput {
  claimId: string;
  evidenceId: string;
  updatedAt: Date;
}

export class AddEvidenceToKnowledgeClaim {
  constructor(
    private readonly knowledgeClaimRepository: KnowledgeClaimRepository,
    private readonly evidenceRepository: EvidenceRepository
  ) {}

  async execute(input: AddEvidenceToKnowledgeClaimInput): Promise<KnowledgeClaim> {
    const claim = await this.knowledgeClaimRepository.findById(input.claimId);
    if (!claim) {
      throw new Error("AddEvidenceToKnowledgeClaim claim not found.");
    }

    const evidence = await this.evidenceRepository.findById(input.evidenceId);
    if (!evidence) {
      throw new Error("AddEvidenceToKnowledgeClaim evidence not found.");
    }

    if (claim.evidenceIds.includes(input.evidenceId)) {
      throw new Error("AddEvidenceToKnowledgeClaim evidence already associated.");
    }

    const updatedClaim = KnowledgeClaim.create({
      id: claim.id,
      professionalId: claim.professionalId,
      type: claim.type,
      content: claim.content,
      evidenceIds: [...claim.evidenceIds, input.evidenceId],
      verificationId: claim.verificationId,
      editorialStatus: claim.editorialStatus,
      createdAt: claim.createdAt,
      updatedAt: input.updatedAt,
    });

    await this.knowledgeClaimRepository.save(updatedClaim);

    return updatedClaim;
  }
}
