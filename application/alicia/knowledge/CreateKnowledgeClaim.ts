import type { KnowledgeClaimType } from "@/domain/knowledge/KnowledgeClaim";
import { KnowledgeClaim } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";
import type { EditorialStatusValue } from "@/domain/professional/EditorialStatus";
import { EditorialStatus } from "@/domain/professional/EditorialStatus";
import type { ProfessionalRepository } from "@/domain/professional/repositories/ProfessionalRepository";

export interface CreateKnowledgeClaimInput {
  id: string;
  professionalId: string;
  type: KnowledgeClaimType;
  content: string;
  evidenceIds?: readonly string[];
  verificationId?: string;
  editorialStatus: EditorialStatusValue;
  createdAt: Date;
  updatedAt: Date;
  editorialReason?: string;
}

export class CreateKnowledgeClaim {
  constructor(
    private readonly professionalRepository: ProfessionalRepository,
    private readonly knowledgeClaimRepository: KnowledgeClaimRepository
  ) {}

  async execute(input: CreateKnowledgeClaimInput): Promise<KnowledgeClaim> {
    const existingClaim = await this.knowledgeClaimRepository.findById(input.id);
    if (existingClaim) {
      throw new Error("CreateKnowledgeClaim claim already exists.");
    }

    const professional = await this.professionalRepository.findById(input.professionalId);
    if (!professional) {
      throw new Error("CreateKnowledgeClaim professional not found.");
    }

    const editorialStatus = EditorialStatus.create({
      value: input.editorialStatus,
      changedAt: input.updatedAt,
      reason: input.editorialReason,
    });

    const claim = KnowledgeClaim.create({
      id: input.id,
      professionalId: input.professionalId,
      type: input.type,
      content: input.content,
      evidenceIds: input.evidenceIds,
      verificationId: input.verificationId,
      editorialStatus,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
    });

    await this.knowledgeClaimRepository.save(claim);

    return claim;
  }
}
