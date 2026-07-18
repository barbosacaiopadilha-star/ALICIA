import { Verification } from "@/domain/professional/Verification";
import type { VerificationResult, VerificationMethod } from "@/domain/professional/Verification";
import type { VerificationRepository } from "@/domain/knowledge/repositories/VerificationRepository";
import type { EvidenceRepository } from "@/domain/knowledge/repositories/EvidenceRepository";

export interface CreateVerificationInput {
  id: string;
  evidenceId: string;
  result: VerificationResult;
  method: VerificationMethod;
  verifiedAt: Date;
  verifierId?: string;
  notes?: string;
}

export class CreateVerification {
  constructor(
    private readonly verificationRepository: VerificationRepository,
    private readonly evidenceRepository: EvidenceRepository
  ) {}

  async execute(input: CreateVerificationInput): Promise<Verification> {
    const existingVerification = await this.verificationRepository.findById(input.id);
    if (existingVerification) {
      throw new Error("CreateVerification verification already exists.");
    }

    const evidence = await this.evidenceRepository.findById(input.evidenceId);
    if (!evidence) {
      throw new Error("CreateVerification evidence not found.");
    }

    const verification = Verification.create({
      id: input.id,
      evidenceId: input.evidenceId,
      result: input.result,
      method: input.method,
      verifiedAt: input.verifiedAt,
      verifierId: input.verifierId,
      notes: input.notes,
    });

    await this.verificationRepository.save(verification);

    return verification;
  }
}
