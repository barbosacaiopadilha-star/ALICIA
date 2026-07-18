import type { Source } from "../../professional/Source";

export interface SourceRepository {
  findById(id: string): Promise<Source | null>;
  findAll(): Promise<ReadonlyArray<Source>>;
  save(source: Source): Promise<void>;
}
