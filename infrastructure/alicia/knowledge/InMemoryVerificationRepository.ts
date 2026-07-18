import type { Verification } from "@/domain/professional/Verification";
import type { VerificationRepository } from "@/domain/knowledge/repositories/VerificationRepository";

export class InMemoryVerificationRepository implements VerificationRepository {
  private readonly verifications: Verification[];

  constructor(verifications: ReadonlyArray<Verification> = []) {
    this.verifications = [...verifications];
  }

  async findById(id: string): Promise<Verification | null> {
    const found = this.verifications.find((verification) => verification.id === id);
    return found ?? null;
  }

  async findByEvidenceId(evidenceId: string): Promise<ReadonlyArray<Verification>> {
    return this.verifications.filter((verification) => verification.evidenceId === evidenceId);
  }

  async save(verification: Verification): Promise<void> {
    const index = this.verifications.findIndex((existing) => existing.id === verification.id);
    if (index >= 0) {
      this.verifications[index] = verification;
    } else {
      this.verifications.push(verification);
    }
  }
}
