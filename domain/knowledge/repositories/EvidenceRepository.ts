import type { Evidence } from "../../professional/Evidence";

export interface EvidenceRepository {
  findById(id: string): Promise<Evidence | null>;
  findBySourceId(sourceId: string): Promise<ReadonlyArray<Evidence>>;
  save(evidence: Evidence): Promise<void>;
}
