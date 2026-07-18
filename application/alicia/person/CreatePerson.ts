import { Person } from "@/domain/person/Person";
import type { PersonRepository } from "@/domain/person/PersonRepository";

export interface CreatePersonInput {
  id: string;
  fullName: string;
  createdAt: Date;
  updatedAt: Date;
  preferredName?: string;
  birthDate?: Date;
}

export class CreatePerson {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(input: CreatePersonInput): Promise<Person> {
    const existingPerson = await this.personRepository.findById(input.id);
    if (existingPerson) {
      throw new Error("CreatePerson person already exists.");
    }

    const person = Person.create({
      id: input.id,
      fullName: input.fullName,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt,
      preferredName: input.preferredName,
      birthDate: input.birthDate,
    });

    await this.personRepository.save(person);

    return person;
  }
}
