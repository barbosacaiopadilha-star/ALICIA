import type { Professional } from "@/domain/professional/Professional";
import type { ProfessionalRepository } from "@/domain/professional/repositories/ProfessionalRepository";

export class MockProfessionalRepository implements ProfessionalRepository {
  private readonly professionals: Professional[];

  constructor(professionals: ReadonlyArray<Professional>) {
    this.professionals = [...professionals];
  }

  async findById(id: string): Promise<Professional | null> {
    const found = this.professionals.find((professional) => professional.id === id);
    return found ?? null;
  }

  async findAll(): Promise<ReadonlyArray<Professional>> {
    return [...this.professionals];
  }

  async save(professional: Professional): Promise<void> {
    const index = this.professionals.findIndex((existing) => existing.id === professional.id);
    if (index >= 0) {
      this.professionals[index] = professional;
    } else {
      this.professionals.push(professional);
    }
  }
}
