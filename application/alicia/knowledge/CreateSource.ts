import { Source } from "@/domain/professional/Source";
import type { SourceType } from "@/domain/professional/Source";
import type { SourceRepository } from "@/domain/knowledge/repositories/SourceRepository";

export interface CreateSourceInput {
  id: string;
  type: SourceType;
  title: string;
  url?: string;
  publisher?: string;
  accessedAt?: Date;
}

export class CreateSource {
  constructor(private readonly sourceRepository: SourceRepository) {}

  async execute(input: CreateSourceInput): Promise<Source> {
    const existingSource = await this.sourceRepository.findById(input.id);
    if (existingSource) {
      throw new Error("CreateSource source already exists.");
    }

    const source = Source.create({
      id: input.id,
      type: input.type,
      title: input.title,
      url: input.url,
      publisher: input.publisher,
      accessedAt: input.accessedAt,
    });

    await this.sourceRepository.save(source);

    return source;
  }
}
