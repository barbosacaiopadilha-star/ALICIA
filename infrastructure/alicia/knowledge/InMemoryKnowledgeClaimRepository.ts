import type { KnowledgeClaim, KnowledgeClaimType } from "@/domain/knowledge/KnowledgeClaim";
import type { KnowledgeClaimRepository } from "@/domain/knowledge/repositories/KnowledgeClaimRepository";

export class InMemoryKnowledgeClaimRepository implements KnowledgeClaimRepository {
  private readonly claims: KnowledgeClaim[];

  constructor(claims: ReadonlyArray<KnowledgeClaim> = []) {
    this.claims = [...claims];
  }

  async findById(id: string): Promise<KnowledgeClaim | null> {
    const found = this.claims.find((claim) => claim.id === id);
    return found ?? null;
  }

  async findByProfessionalId(professionalId: string): Promise<ReadonlyArray<KnowledgeClaim>> {
    return this.claims.filter((claim) => claim.professionalId === professionalId);
  }

  async findByProfessionalIdAndType(
    professionalId: string,
    type: KnowledgeClaimType
  ): Promise<ReadonlyArray<KnowledgeClaim>> {
    return this.claims.filter(
      (claim) => claim.professionalId === professionalId && claim.type === type
    );
  }

  async save(claim: KnowledgeClaim): Promise<void> {
    const index = this.claims.findIndex((existing) => existing.id === claim.id);
    if (index >= 0) {
      this.claims[index] = claim;
    } else {
      this.claims.push(claim);
    }
  }
}
