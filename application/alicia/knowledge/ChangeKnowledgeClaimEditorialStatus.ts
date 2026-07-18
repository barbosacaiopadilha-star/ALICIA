import { KnowledgeClaim } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";
import { EditorialStatus } from "@/domain/professional/EditorialStatus";
import type { EditorialStatusValue } from "@/domain/professional/EditorialStatus";

export interface ChangeKnowledgeClaimEditorialStatusInput {
  claimId: string;
  editorialStatus: EditorialStatusValue;
  changedAt: Date;
  reason?: string;
}

export class ChangeKnowledgeClaimEditorialStatus {
  constructor(private readonly knowledgeClaimRepository: KnowledgeClaimRepository) {}

  async execute(input: ChangeKnowledgeClaimEditorialStatusInput): Promise<KnowledgeClaim> {
    const claim = await this.knowledgeClaimRepository.findById(input.claimId);
    if (!claim) {
      throw new Error("ChangeKnowledgeClaimEditorialStatus claim not found.");
    }

    if (claim.editorialStatus.value === input.editorialStatus) {
      throw new Error("ChangeKnowledgeClaimEditorialStatus status already applied.");
    }

    if (input.editorialStatus === "published") {
      if (claim.evidenceIds.length === 0) {
        throw new Error("ChangeKnowledgeClaimEditorialStatus published claim requires evidence.");
      }
      if (claim.verificationId === undefined) {
        throw new Error(
          "ChangeKnowledgeClaimEditorialStatus published claim requires verification."
        );
      }
    }

    const newEditorialStatus = EditorialStatus.create({
      value: input.editorialStatus,
      changedAt: input.changedAt,
      reason: input.reason,
    });

    const updatedClaim = KnowledgeClaim.create({
      id: claim.id,
      professionalId: claim.professionalId,
      type: claim.type,
      content: claim.content,
      evidenceIds: [...claim.evidenceIds],
      verificationId: claim.verificationId,
      editorialStatus: newEditorialStatus,
      createdAt: claim.createdAt,
      updatedAt: input.changedAt,
    });

    await this.knowledgeClaimRepository.save(updatedClaim);

    return updatedClaim;
  }
}
