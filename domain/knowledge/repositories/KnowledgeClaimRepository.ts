import type { KnowledgeClaim, KnowledgeClaimType } from "../KnowledgeClaim";

export interface KnowledgeClaimRepository {
  findById(id: string): Promise<KnowledgeClaim | null>;
  findByProfessionalId(professionalId: string): Promise<ReadonlyArray<KnowledgeClaim>>;
  findByProfessionalIdAndType(
    professionalId: string,
    type: KnowledgeClaimType
  ): Promise<ReadonlyArray<KnowledgeClaim>>;
  save(claim: KnowledgeClaim): Promise<void>;
}
