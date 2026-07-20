import { Identity } from "./Identity";
import { Registration } from "./Registration";
import { Specialty } from "./Specialty";
import { Education } from "./Education";
import { PracticeLocation } from "./PracticeLocation";
import { Experience } from "./Experience";
import type { Condition } from "./Condition";
import type { Capability } from "./Capability";

export interface ProfessionalProps {
  id: string;
  identity: Identity;
  registrations?: Registration[];
  specialties?: Specialty[];
  education?: Education[];
  practiceLocations?: PracticeLocation[];
  experience?: Experience[];
  readonly conditions?: ReadonlyArray<Condition>;
  readonly capabilities?: ReadonlyArray<Capability>;
}

export class Professional {
  readonly id: string;
  readonly identity: Identity;
  private readonly _registrations: ReadonlyArray<Registration>;
  private readonly _specialties: ReadonlyArray<Specialty>;
  private readonly _education: ReadonlyArray<Education>;
  private readonly _practiceLocations: ReadonlyArray<PracticeLocation>;
  private readonly _experience: ReadonlyArray<Experience>;
  private readonly _conditions: ReadonlyArray<Condition>;
  private readonly _capabilities: ReadonlyArray<Capability>;

  private constructor(
    id: string,
    identity: Identity,
    registrations: Registration[],
    specialties: Specialty[],
    education: Education[],
    practiceLocations: PracticeLocation[],
    experience: Experience[],
    conditions: Condition[],
    capabilities: Capability[]
  ) {
    this.id = id;
    this.identity = identity;
    this._registrations = Object.freeze(registrations);
    this._specialties = Object.freeze(specialties);
    this._education = Object.freeze(education);
    this._practiceLocations = Object.freeze(practiceLocations);
    this._experience = Object.freeze(experience);
    this._conditions = Object.freeze(conditions);
    this._capabilities = Object.freeze(capabilities);
  }

  static create(props: ProfessionalProps): Professional {
    const id = props.id?.trim();
    if (!id) {
      throw new Error("Professional: id é obrigatório.");
    }
    if (!props.identity) {
      throw new Error("Professional: identity é obrigatória.");
    }

    const registrations: Registration[] = [];
    for (const registration of props.registrations ?? []) {
      const isDuplicate = registrations.some((existing) => existing.matches(registration));
      if (isDuplicate) {
        throw new Error(
          `Professional: registro duplicado (council=${registration.council}, number=${registration.number}, state=${registration.state}).`
        );
      }
      registrations.push(registration);
    }

    const specialties = [...(props.specialties ?? [])];
    const education = [...(props.education ?? [])];
    const practiceLocations = [...(props.practiceLocations ?? [])];
    const experience = [...(props.experience ?? [])];
    const conditions = [...(props.conditions ?? [])];
    const capabilities = [...(props.capabilities ?? [])];

    return new Professional(
      id,
      props.identity,
      registrations,
      specialties,
      education,
      practiceLocations,
      experience,
      conditions,
      capabilities
    );
  }

  get registrations(): ReadonlyArray<Registration> {
    return this._registrations;
  }

  get specialties(): ReadonlyArray<Specialty> {
    return this._specialties;
  }

  get education(): ReadonlyArray<Education> {
    return this._education;
  }

  get practiceLocations(): ReadonlyArray<PracticeLocation> {
    return this._practiceLocations;
  }

  get experience(): ReadonlyArray<Experience> {
    return this._experience;
  }

  get conditions(): ReadonlyArray<Condition> {
    return this._conditions;
  }

  get capabilities(): ReadonlyArray<Capability> {
    return this._capabilities;
  }
}
