import { Identity } from "./Identity";
import { Registration } from "./Registration";
import { Specialty } from "./Specialty";
import { Education } from "./Education";

export interface ProfessionalProps {
  id: string;
  identity: Identity;
  registrations?: Registration[];
  specialties?: Specialty[];
  education?: Education[];
}

export class Professional {
  readonly id: string;
  readonly identity: Identity;
  private readonly _registrations: ReadonlyArray<Registration>;
  private readonly _specialties: ReadonlyArray<Specialty>;
  private readonly _education: ReadonlyArray<Education>;

  private constructor(
    id: string,
    identity: Identity,
    registrations: Registration[],
    specialties: Specialty[],
    education: Education[]
  ) {
    this.id = id;
    this.identity = identity;
    this._registrations = Object.freeze(registrations);
    this._specialties = Object.freeze(specialties);
    this._education = Object.freeze(education);
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

    return new Professional(id, props.identity, registrations, specialties, education);
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
}
