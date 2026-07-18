import type { Person } from "@/domain/person/Person";
import type { PersonRepository } from "@/domain/person/PersonRepository";

export class InMemoryPersonRepository implements PersonRepository {
  private readonly people: Map<string, Person> = new Map();

  async findById(id: string): Promise<Person | null> {
    return this.people.get(id) ?? null;
  }

  async save(person: Person): Promise<void> {
    this.people.set(person.id, person);
  }
}
