import type { Person } from "@/domain/person/Person";
import type { PersonRepository } from "@/domain/person/PersonRepository";

export interface GetPersonByIdInput {
  id: string;
}

export class GetPersonById {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(input: GetPersonByIdInput): Promise<Person> {
    const person = await this.personRepository.findById(input.id);
    if (!person) {
      throw new Error("GetPersonById person not found.");
    }

    return person;
  }
}
