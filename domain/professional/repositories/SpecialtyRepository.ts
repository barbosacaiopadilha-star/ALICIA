import type { Specialty } from "../Specialty";

export interface SpecialtyRepository {
  findById(id: string): Promise<Specialty | null>;
  findByNormalizedName(normalizedName: string): Promise<Specialty | null>;
  findAll(): Promise<ReadonlyArray<Specialty>>;
}
