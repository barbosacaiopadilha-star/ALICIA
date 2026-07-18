import { Evidence } from "@/domain/professional/Evidence";
import type { EvidenceType } from "@/domain/professional/Evidence";
import type { EvidenceRepository } from "@/domain/knowledge/repositories/EvidenceRepository";
import type { SourceRepository } from "@/domain/knowledge/repositories/SourceRepository";

export interface CreateEvidenceInput {
  id: string;
  sourceId: string;
  type: EvidenceType;
  claim: string;
  excerpt?: string;
  observedAt?: Date;
}

export class CreateEvidence {
  constructor(
    private readonly evidenceRepository: EvidenceRepository,
    private readonly sourceRepository: SourceRepository
  ) {}

  async execute(input: CreateEvidenceInput): Promise<Evidence> {
    const existingEvidence = await this.evidenceRepository.findById(input.id);
    if (existingEvidence) {
      throw new Error("CreateEvidence evidence already exists.");
    }

    const source = await this.sourceRepository.findById(input.sourceId);
    if (!source) {
      throw new Error("CreateEvidence source not found.");
    }

    const evidence = Evidence.create({
      id: input.id,
      sourceId: input.sourceId,
      type: input.type,
      claim: input.claim,
      excerpt: input.excerpt,
      observedAt: input.observedAt,
    });

    await this.evidenceRepository.save(evidence);

    return evidence;
  }
}
