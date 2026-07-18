import type { KnowledgeClaim } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";
import type { Evidence } from "@/domain/professional/Evidence";
import type { EvidenceRepository } from "@/domain/knowledge/repositories/EvidenceRepository";
import type { Source } from "@/domain/professional/Source";
import type { SourceRepository } from "@/domain/knowledge/repositories/SourceRepository";
import type { Verification } from "@/domain/professional/Verification";
import type { VerificationRepository } from "@/domain/knowledge/repositories/VerificationRepository";

export interface GetKnowledgeClaimTraceInput {
  claimId: string;
}

export interface KnowledgeClaimEvidenceTrace {
  evidence: Evidence;
  source: Source;
}

export interface KnowledgeClaimTrace {
  claim: KnowledgeClaim;
  evidences: ReadonlyArray<KnowledgeClaimEvidenceTrace>;
  verification: Verification | null;
}

export class GetKnowledgeClaimTrace {
  constructor(
    private readonly knowledgeClaimRepository: KnowledgeClaimRepository,
    private readonly evidenceRepository: EvidenceRepository,
    private readonly sourceRepository: SourceRepository,
    private readonly verificationRepository: VerificationRepository
  ) {}

  async execute(input: GetKnowledgeClaimTraceInput): Promise<KnowledgeClaimTrace> {
    const claim = await this.knowledgeClaimRepository.findById(input.claimId);
    if (!claim) {
      throw new Error("GetKnowledgeClaimTrace claim not found.");
    }

    const evidences: KnowledgeClaimEvidenceTrace[] = [];
    for (const evidenceId of claim.evidenceIds) {
      const evidence = await this.evidenceRepository.findById(evidenceId);
      if (!evidence) {
        throw new Error("GetKnowledgeClaimTrace evidence not found.");
      }

      const source = await this.sourceRepository.findById(evidence.sourceId);
      if (!source) {
        throw new Error("GetKnowledgeClaimTrace source not found.");
      }

      evidences.push({ evidence, source });
    }

    let verification: Verification | null = null;
    if (claim.verificationId !== undefined) {
      verification = await this.verificationRepository.findById(claim.verificationId);
      if (!verification) {
        throw new Error("GetKnowledgeClaimTrace verification not found.");
      }

      if (!claim.evidenceIds.includes(verification.evidenceId)) {
        throw new Error("GetKnowledgeClaimTrace verification evidence not associated.");
      }
    }

    return {
      claim,
      evidences,
      verification,
    };
  }
}
