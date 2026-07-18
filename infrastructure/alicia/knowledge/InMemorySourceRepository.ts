import type { Source } from "@/domain/professional/Source";
import type { SourceRepository } from "@/domain/knowledge/repositories/SourceRepository";

export class InMemorySourceRepository implements SourceRepository {
  private readonly sources: Source[];

  constructor(sources: ReadonlyArray<Source> = []) {
    this.sources = [...sources];
  }

  async findById(id: string): Promise<Source | null> {
    const found = this.sources.find((source) => source.id === id);
    return found ?? null;
  }

  async findAll(): Promise<ReadonlyArray<Source>> {
    return [...this.sources];
  }

  async save(source: Source): Promise<void> {
    const index = this.sources.findIndex((existing) => existing.id === source.id);
    if (index >= 0) {
      this.sources[index] = source;
    } else {
      this.sources.push(source);
    }
  }
}
