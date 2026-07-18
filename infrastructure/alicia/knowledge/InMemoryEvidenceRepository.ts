import type { Evidence } from "@/domain/professional/Evidence";
import type { EvidenceRepository } from "@/domain/knowledge/repositories/EvidenceRepository";

export class InMemoryEvidenceRepository implements EvidenceRepository {
  private readonly evidences: Evidence[];

  constructor(evidences: ReadonlyArray<Evidence> = []) {
    this.evidences = [...evidences];
  }

  async findById(id: string): Promise<Evidence | null> {
    const found = this.evidences.find((evidence) => evidence.id === id);
    return found ?? null;
  }

  async findBySourceId(sourceId: string): Promise<ReadonlyArray<Evidence>> {
    return this.evidences.filter((evidence) => evidence.sourceId === sourceId);
  }

  async save(evidence: Evidence): Promise<void> {
    const index = this.evidences.findIndex((existing) => existing.id === evidence.id);
    if (index >= 0) {
      this.evidences[index] = evidence;
    } else {
      this.evidences.push(evidence);
    }
  }
}
