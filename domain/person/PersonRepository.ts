import type { Person } from "./Person";

export interface PersonRepository {
  findById(id: string): Promise<Person | null>;
  save(person: Person): Promise<void>;
}
