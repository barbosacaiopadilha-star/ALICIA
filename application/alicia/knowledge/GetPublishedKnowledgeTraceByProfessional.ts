import type { KnowledgeClaim } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";
import type { Evidence } from "@/domain/professional/Evidence";
import type { EvidenceRepository } from "@/domain/knowledge/repositories/EvidenceRepository";
import type { Source } from "@/domain/professional/Source";
import type { SourceRepository } from "@/domain/knowledge/repositories/SourceRepository";
import type { Verification } from "@/domain/professional/Verification";
import type { VerificationRepository } from "@/domain/knowledge/repositories/VerificationRepository";
import type { ProfessionalRepository } from "@/domain/professional/repositories/ProfessionalRepository";

export interface GetPublishedKnowledgeTraceByProfessionalInput {
  professionalId: string;
}

export interface PublishedKnowledgeEvidenceTrace {
  evidence: Evidence;
  source: Source;
}

export interface PublishedKnowledgeClaimTrace {
  claim: KnowledgeClaim;
  evidences: ReadonlyArray<PublishedKnowledgeEvidenceTrace>;
  verification: Verification | null;
}

export class GetPublishedKnowledgeTraceByProfessional {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly knowledgeClaimRepository: KnowledgeClaimRepository,
    private readonly evidenceRepository: EvidenceRepository,
    private readonly sourceRepository: SourceRepository,
    private readonly verificationRepository: VerificationRepository
  ) {}

  async execute(
    input: GetPublishedKnowledgeTraceByProfessionalInput
  ): Promise<ReadonlyArray<PublishedKnowledgeClaimTrace>> {
    const professional = await this.professionalRepository.findById(input.professionalId);
    if (!professional) {
      throw new Error("GetPublishedKnowledgeTraceByProfessional professional not found.");
    }

    const claims = await this.knowledgeClaimRepository.findByProfessionalId(
      input.professionalId
    );
    const publishedClaims = claims.filter(
      (claim) => claim.editorialStatus.value === "published"
    );

    const traces: PublishedKnowledgeClaimTrace[] = [];

    for (const claim of publishedClaims) {
      const evidences: PublishedKnowledgeEvidenceTrace[] = [];
      for (const evidenceId of claim.evidenceIds) {
        const evidence = await this.evidenceRepository.findById(evidenceId);
        if (!evidence) {
          throw new Error("GetPublishedKnowledgeTraceByProfessional evidence not found.");
        }

        const source = await this.sourceRepository.findById(evidence.sourceId);
        if (!source) {
          throw new Error("GetPublishedKnowledgeTraceByProfessional source not found.");
        }

        evidences.push({ evidence, source });
      }

      let verification: Verification | null = null;
      if (claim.verificationId !== undefined) {
        verification = await this.verificationRepository.findById(claim.verificationId);
        if (!verification) {
          throw new Error("GetPublishedKnowledgeTraceByProfessional verification not found.");
        }

        if (!claim.evidenceIds.includes(verification.evidenceId)) {
          throw new Error(
            "GetPublishedKnowledgeTraceByProfessional verification evidence not associated."
          );
        }
      }

      traces.push({ claim, evidences, verification });
    }

    return traces;
  }
}
