import type { Professional } from "../Professional";

export interface ProfessionalRepository {
  findById(id: string): Promise<Professional | null>;
  findAll(): Promise<ReadonlyArray<Professional>>;
  save(professional: Professional): Promise<void>;
}
