import type { Verification } from "../../professional/Verification";

export interface VerificationRepository {
  findById(id: string): Promise<Verification | null>;
  findByEvidenceId(evidenceId: string): Promise<ReadonlyArray<Verification>>;
  save(verification: Verification): Promise<void>;
}
