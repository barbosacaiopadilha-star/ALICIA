import { KnowledgeClaim } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";
import type { VerificationRepository } from "@/domain/knowledge/repositories/VerificationRepository";

export interface AttachVerificationToKnowledgeClaimInput {
  claimId: string;
  verificationId: string;
  updatedAt: Date;
}

export class AttachVerificationToKnowledgeClaim {
  constructor(
    private readonly knowledgeClaimRepository: KnowledgeClaimRepository,
    private readonly verificationRepository: VerificationRepository
  ) {}

  async execute(input: AttachVerificationToKnowledgeClaimInput): Promise<KnowledgeClaim> {
    const claim = await this.knowledgeClaimRepository.findById(input.claimId);
    if (!claim) {
      throw new Error("AttachVerificationToKnowledgeClaim claim not found.");
    }

    const verification = await this.verificationRepository.findById(input.verificationId);
    if (!verification) {
      throw new Error("AttachVerificationToKnowledgeClaim verification not found.");
    }

    if (!claim.evidenceIds.includes(verification.evidenceId)) {
      throw new Error(
        "AttachVerificationToKnowledgeClaim verification evidence not associated."
      );
    }

    if (claim.verificationId === verification.id) {
      throw new Error("AttachVerificationToKnowledgeClaim verification already associated.");
    }

    if (claim.verificationId !== undefined) {
      throw new Error("AttachVerificationToKnowledgeClaim claim already has verification.");
    }

    const updatedClaim = KnowledgeClaim.create({
      id: claim.id,
      professionalId: claim.professionalId,
      type: claim.type,
      content: claim.content,
      evidenceIds: [...claim.evidenceIds],
      verificationId: verification.id,
      editorialStatus: claim.editorialStatus,
      createdAt: claim.createdAt,
      updatedAt: input.updatedAt,
    });

    await this.knowledgeClaimRepository.save(updatedClaim);

    return updatedClaim;
  }
}
